import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { aiRouter } from "./aiRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Backend] ERRO: Variáveis do Supabase não encontradas!");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  // Roteador de verificação mantido vazio para evitar quebra de tipos no frontend se houver referências
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
