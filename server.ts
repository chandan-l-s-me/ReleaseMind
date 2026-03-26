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
