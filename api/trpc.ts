import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";
import express from "express";

const app = express();
app.use(express.json({ limit: "50mb" }));

export default createExpressMiddleware({
  router: appRouter,
  createContext,
});
