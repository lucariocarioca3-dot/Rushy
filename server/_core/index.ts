import "dotenv/config";
import express from "express";
import axios from "axios";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

export const app = express();
const server = createServer(app);

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

// Endpoint Direto para Chat IA (Contornando tRPC para evitar erros 405/500 na Vercel)
app.post("/api/chat-ia", async (req, res) => {
  const { messages, context } = req.body;
  const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: "Chave Gemini não configurada no servidor." });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          { role: "user", parts: [{ text: `Você é o assistente da Rushy. Contexto: ${JSON.stringify(context)}` }] },
          ...messages.filter((m: any) => m.role !== 'system').map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }]
          }))
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta da IA.";
    res.json({ text });
  } catch (error: any) {
    console.error("Erro Gemini:", error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// development mode uses Vite, production mode uses static files
if (process.env.NODE_ENV === "development") {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

if (process.env.NODE_ENV !== "production") {
  const startServer = async () => {
    const preferredPort = parseInt(process.env.PORT || "3000");
    const port = await findAvailablePort(preferredPort);

    if (port !== preferredPort) {
      console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
    }

    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}/`);
    });
  };
  startServer().catch(console.error);
}
