import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';

// Usando as mesmas configurações do cliente para o backend
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
import { sendVerificationCode } from "./mail";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
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
      .mutation(async ({ input }) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        const { error } = await supabase
          .from('verification_codes')
          .insert([{ email: input.email.toLowerCase(), code, expires_at: expiresAt.toISOString() }]);

        if (error) {
          console.error("Erro ao salvar código:", error);
          throw new Error("Erro ao gerar código de verificação");
        }

        const sent = await sendVerificationCode(input.email, code);
        if (!sent) {
          throw new Error("Erro ao enviar e-mail de verificação");
        }

        return { success: true };
      }),
    verifyCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string().length(6) }))
      .mutation(async ({ input }) => {
        const { data, error } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('email', input.email.toLowerCase())
          .eq('code', input.code)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) {
          return { success: false, message: "Código inválido ou expirado" };
        }

        // Limpar códigos usados
        await supabase.from('verification_codes').delete().eq('email', input.email.toLowerCase());

        return { success: true };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
