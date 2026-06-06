import "dotenv/config";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { aiRouter } from "./aiRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  verification: router({
    sendCode: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async () => {
        return { success: true };
      }),
    verifyCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string() }))
      .mutation(async () => {
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
