import "dotenv/config";
import helmet from "helmet";
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

// Configuração do Helmet com CSP personalizado para o Rushy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Necessário para alguns scripts inline do Vite/React
          "'unsafe-eval'",   // Muitas vezes necessário em ambiente de desenvolvimento (Vite)
          "https://forge.butterfly-effect.dev", // Para o Google Maps Proxy usado no Map.tsx
          "https://*.google.com", // Para scripts do Google Maps
          "https://*.googleapis.com", // Para scripts do Google Maps
          "https://*.gstatic.com", // Para scripts do Google Maps
          // Adicione aqui o domínio do seu analytics (ex: umami) se aplicável
        ],
        connectSrc: [
          "'self'",
          "https://lblycbpbwokclsircdhq.supabase.co", // Seu projeto Supabase
          "https://forge.butterfly-effect.dev", // Proxy do Google Maps
          "ws:", // Necessário para o HMR do Vite em desenvolvimento
          "wss:",
          "https://*.google.com", // Para conexões do Google Maps
          "https://*.googleapis.com", // Para conexões do Google Maps
          "https://*.gstatic.com", // Para conexões do Google Maps
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://maps.googleapis.com", // Se carregar imagens do Google Maps diretamente
          "https://lblycbpbwokclsircdhq.supabase.co", // Imagens do storage do Supabase
          "https://*.google.com", // Para imagens do Google Maps
          "https://*.gstatic.com", // Para imagens do Google Maps
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Necessário para o Tailwind e componentes como o chart.tsx
          "https://fonts.googleapis.com",
          "https://*.gstatic.com", // Para estilos do Google Fonts
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

const server = createServer(app);

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

registerStorageProxy(app);
registerOAuthRoutes(app);

// Endpoint de IA movido para Vercel Edge Function (/api/chat-ia.js) para maior estabilidade.

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
