export interface GitHubContextResponse {
  sourceType: "repo" | "pull_request";
  resolvedRepoUrl: string;
  title: string;
  contextText: string;
  includedFiles: string[];
  scannedTextFileCount: number;
  truncated: boolean;
}

export async function fetchGitHubContext(url: string): Promise<GitHubContextResponse> {
  const response = await fetch("/api/github/context", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch GitHub context.");
  }

  return data as GitHubContextResponse;
}
