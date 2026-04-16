import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type GitHubTarget =
  | { type: "repo"; owner: string; repo: string }
  | { type: "pull"; owner: string; repo: string; pullNumber: number };

const REPO_FILE_CHAR_LIMIT = 180000;
const MAX_SINGLE_FILE_SIZE = 100000;
const TEXT_FILE_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".mdx",
  ".py",
  ".java",
  ".go",
  ".rb",
  ".php",
  ".html",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".yml",
  ".yaml",
  ".toml",
  ".txt",
  ".sql",
  ".sh",
  ".c",
  ".cc",
  ".cpp",
  ".h",
  ".hpp",
  ".rs",
  ".kt",
  ".swift",
  ".xml"
]);
const PRIORITY_PATH_PREFIXES = [
  "src/",
  "app/",
  "pages/",
  "components/",
  "lib/",
  "services/",
  "server/",
  "api/",
  "routes/",
  "controllers/",
  "config/",
  "public/"
];
const IGNORED_PATH_SEGMENTS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
  ".turbo",
  "vendor"
]);

function parseGitHubUrl(rawUrl: string): GitHubTarget | null {
  try {
    const url = new URL(rawUrl);
    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      return null;
    }

    const [owner, repo, third, fourth] = parts;
    const cleanRepo = repo.replace(/\.git$/, "");

    if ((third === "pull" || third === "pulls") && fourth) {
      const pullNumber = Number(fourth);
      if (!Number.isInteger(pullNumber) || pullNumber <= 0) {
        return null;
      }

      return { type: "pull", owner, repo: cleanRepo, pullNumber };
    }

    return { type: "repo", owner, repo: cleanRepo };
  } catch {
    return null;
  }
}

function getGitHubHeaders(accept = "application/vnd.github+json") {
  const headers: Record<string, string> = {
    Accept: accept,
    "User-Agent": "ReleaseMind"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchGitHubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: getGitHubHeaders()
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchGitHubText(url: string, accept: string): Promise<string> {
  const response = await fetch(url, {
    headers: getGitHubHeaders(accept)
  });

  if (response.status === 404) {
    return "";
  }

  if (!response.ok) {
    throw new Error(`GitHub content request failed with status ${response.status}`);
  }

  return response.text();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}\n...[truncated]`;
}

function isLikelyTextFile(filePath: string) {
  const normalized = filePath.toLowerCase();
  const fileName = normalized.split("/").pop() || normalized;

  if ([...IGNORED_PATH_SEGMENTS].some((segment) => normalized.includes(`/${segment}/`) || normalized.startsWith(`${segment}/`))) {
    return false;
  }

  if (
    fileName === "dockerfile" ||
    fileName === "makefile" ||
    fileName === ".gitignore" ||
    fileName === ".gitattributes" ||
    fileName === ".env.example"
  ) {
    return true;
  }

  const extensionMatch = fileName.match(/(\.[^.]+)$/);
  return extensionMatch ? TEXT_FILE_EXTENSIONS.has(extensionMatch[1]) : false;
}

function scoreFilePath(filePath: string) {
  let score = 0;
  const normalized = filePath.toLowerCase();
  if (normalized.includes("readme")) score += 10;
  if (normalized.includes("package.json")) score += 9;
  if (normalized.includes("tsconfig")) score += 8;
  if (normalized.includes("vite.config")) score += 8;
  if (normalized.includes("server")) score += 6;
  if (normalized.includes("config")) score += 5;

  PRIORITY_PATH_PREFIXES.forEach((prefix, index) => {
    if (normalized.startsWith(prefix)) {
      score += PRIORITY_PATH_PREFIXES.length - index + 5;
    }
  });

  return score;
}

async function fetchRepoTree(owner: string, repo: string, ref: string) {
  const commitData = await fetchGitHubJson<any>(`https://api.github.com/repos/${owner}/${repo}/commits/${ref}`);
  const treeSha = commitData.commit?.tree?.sha;
  if (!treeSha) {
    throw new Error("Unable to resolve repository tree from GitHub.");
  }

  const treeData = await fetchGitHubJson<any>(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
  return Array.isArray(treeData.tree) ? treeData.tree : [];
}

async function buildRepoFileContext(owner: string, repo: string, ref: string) {
  const tree = await fetchRepoTree(owner, repo, ref);
  const candidateFiles = tree
    .filter((item: any) => item.type === "blob" && typeof item.path === "string" && isLikelyTextFile(item.path))
    .filter((item: any) => typeof item.size === "number" ? item.size <= MAX_SINGLE_FILE_SIZE : true)
    .sort((a: any, b: any) => scoreFilePath(b.path) - scoreFilePath(a.path) || a.path.localeCompare(b.path));

  let totalChars = 0;
  let truncated = false;
  const fileSections: string[] = [];
  const includedFiles: string[] = [];

  for (const file of candidateFiles) {
    if (!file.sha || !file.path) {
      continue;
    }

    const blob = await fetchGitHubJson<any>(`https://api.github.com/repos/${owner}/${repo}/git/blobs/${file.sha}`);
    const encoding = blob.encoding === "base64" ? "base64" : undefined;
    if (!encoding || typeof blob.content !== "string") {
      continue;
    }

    const rawText = Buffer.from(blob.content, encoding).toString("utf8");
    if (rawText.includes("\u0000")) {
      continue;
    }

    const section = `File: ${file.path}\n${truncateText(rawText, 6000)}`;
    if (totalChars + section.length > REPO_FILE_CHAR_LIMIT) {
      truncated = true;
      break;
    }

    fileSections.push(section);
    includedFiles.push(file.path);
    totalChars += section.length;
  }

  return {
    fileContext: fileSections.join("\n\n---\n\n"),
    includedFiles,
    scannedTextFileCount: candidateFiles.length,
    truncated
  };
}

async function buildRepoContext(owner: string, repo: string) {
  const [repoData, commits, readme] = await Promise.all([
    fetchGitHubJson<any>(`https://api.github.com/repos/${owner}/${repo}`),
    fetchGitHubJson<any[]>(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`),
    fetchGitHubText(`https://api.github.com/repos/${owner}/${repo}/readme`, "application/vnd.github.raw+json")
  ]);
  const repoFiles = await buildRepoFileContext(owner, repo, repoData.default_branch);

  const commitSummary = commits
    .map((commit) => {
      const sha = String(commit.sha || "").slice(0, 7);
      const message = commit.commit?.message?.split("\n")[0] || "No commit message";
      return `- ${sha}: ${message}`;
    })
    .join("\n");

  const topics = Array.isArray(repoData.topics) && repoData.topics.length > 0
    ? repoData.topics.join(", ")
    : "None listed";

  const contextText = [
    `GitHub Repository: ${repoData.full_name}`,
    `Description: ${repoData.description || "No description provided."}`,
    `Default Branch: ${repoData.default_branch}`,
    `Primary Language: ${repoData.language || "Unknown"}`,
    `Visibility: ${repoData.private ? "Private" : "Public"}`,
    `Stars: ${repoData.stargazers_count ?? 0}`,
    `Topics: ${topics}`,
    "",
    "Recent Commits:",
    commitSummary || "- No recent commits found.",
    "",
    "README Excerpt:",
    truncateText(readme || "README not available.", 4000),
    "",
    `Repository Files Read: ${repoFiles.includedFiles.length} of ${repoFiles.scannedTextFileCount}${repoFiles.truncated ? " (truncated for model size)" : ""}`,
    "",
    "Repository File Contents:",
    repoFiles.fileContext || "No readable text files were fetched."
  ].join("\n");

  return {
    sourceType: "repo",
    resolvedRepoUrl: repoData.html_url,
    title: repoData.full_name,
    contextText,
    includedFiles: repoFiles.includedFiles,
    scannedTextFileCount: repoFiles.scannedTextFileCount,
    truncated: repoFiles.truncated
  };
}

async function buildPullRequestContext(owner: string, repo: string, pullNumber: number) {
  const [repoData, pullData, files] = await Promise.all([
    fetchGitHubJson<any>(`https://api.github.com/repos/${owner}/${repo}`),
    fetchGitHubJson<any>(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`),
    fetchGitHubJson<any[]>(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files?per_page=100`)
  ]);
  const repoFiles = await buildRepoFileContext(owner, repo, pullData.head?.sha || repoData.default_branch);

  const fileSummaries = files.map((file) => {
    const patch = typeof file.patch === "string" ? truncateText(file.patch, 1200) : "Patch not available.";
    return [
      `File: ${file.filename}`,
      `Status: ${file.status}, additions: ${file.additions}, deletions: ${file.deletions}, changes: ${file.changes}`,
      patch
    ].join("\n");
  });

  const contextText = [
    `GitHub Pull Request: ${repoData.full_name}#${pullNumber}`,
    `Title: ${pullData.title}`,
    `State: ${pullData.state}`,
    `Base: ${pullData.base?.ref || "unknown"} <- Head: ${pullData.head?.ref || "unknown"}`,
    `Author: ${pullData.user?.login || "unknown"}`,
    `Changed Files: ${pullData.changed_files ?? files.length}`,
    `Commits: ${pullData.commits ?? "unknown"}`,
    `Additions: ${pullData.additions ?? 0}, Deletions: ${pullData.deletions ?? 0}`,
    "",
    "PR Description:",
    truncateText(pullData.body || "No PR description provided.", 2000),
    "",
    `Repository Files Read: ${repoFiles.includedFiles.length} of ${repoFiles.scannedTextFileCount}${repoFiles.truncated ? " (truncated for model size)" : ""}`,
    "",
    "Repository File Contents:",
    repoFiles.fileContext || "No readable text files were fetched.",
    "",
    "Changed Files and Patch Excerpts:",
    truncateText(fileSummaries.join("\n\n---\n\n") || "No file changes available.", 12000)
  ].join("\n");

  return {
    sourceType: "pull_request",
    resolvedRepoUrl: pullData.html_url,
    title: `${repoData.full_name}#${pullNumber}`,
    contextText,
    includedFiles: repoFiles.includedFiles,
    scannedTextFileCount: repoFiles.scannedTextFileCount,
    truncated: repoFiles.truncated
  };
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  // Room state storage (in-memory for demo, would be Redis/DB in production)
  const roomStates = new Map<string, any>();

  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
      
      // Send current state if exists
      if (roomStates.has(roomId)) {
        socket.emit("state-update", roomStates.get(roomId));
      }
    });

    socket.on("update-state", ({ roomId, state }) => {
      roomStates.set(roomId, state);
      socket.to(roomId).emit("state-update", state);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/github/context", async (req, res) => {
    const rawUrl = typeof req.body?.url === "string" ? req.body.url.trim() : "";
    if (!rawUrl) {
      return res.status(400).json({ error: "GitHub URL is required." });
    }

    const target = parseGitHubUrl(rawUrl);
    if (!target) {
      return res.status(400).json({ error: "Please provide a valid GitHub repository or pull request URL." });
    }

    try {
      const payload = target.type === "pull"
        ? await buildPullRequestContext(target.owner, target.repo, target.pullNumber)
        : await buildRepoContext(target.owner, target.repo);

      return res.json(payload);
    } catch (error) {
      console.error("GitHub context fetch failed:", error);
      return res.status(502).json({
        error: "Unable to fetch data from GitHub. Make sure the repository or pull request is public and reachable."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    if (!fs.existsSync(distPath)) {
      console.error("ERROR: 'dist' folder not found. Did you run 'npm run build'?");
      process.exit(1);
    }

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀 ReleaseMind is running!`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`📡 Network: http://0.0.0.0:${PORT}\n`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
