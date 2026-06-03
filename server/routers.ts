import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';

// Usando as mesmas configurações do cliente para o backend
// Nota: No Vercel/Produção, as variáveis VITE_ podem não estar disponíveis no processo Node se não forem prefixadas ou configuradas explicitamente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[Backend] ERRO: Variáveis do Supabase não encontradas!");
}

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
        try {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

          console.log(`[Verification] Gerando código para: ${input.email}`);
          const { error } = await supabase
            .from('verification_codes')
            .insert([{ email: input.email.toLowerCase(), code, expires_at: expiresAt.toISOString() }]);

          if (error) {
            console.error("[Verification] Erro Supabase:", error);
            throw new Error("Erro ao salvar código de verificação");
          }

          const sent = await sendVerificationCode(input.email, code);
          if (!sent) {
            console.error("[Verification] Falha no envio do e-mail");
            throw new Error("Falha ao enviar e-mail de verificação");
          }

          console.log(`[Verification] Código enviado com sucesso para: ${input.email}`);
          return { success: true };
        } catch (err: any) {
          console.error("[Verification] Erro fatal em sendCode:", err);
          throw err;
        }
      }),
    verifyCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string().length(6) }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[Verification] Verificando código para: ${input.email}`);
          const { data, error } = await supabase
            .from('verification_codes')
            .select('*')
            .eq('email', input.email.toLowerCase())
            .eq('code', input.code)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error("[Verification] Erro Supabase na verificação:", error);
            return { success: false, message: "Erro ao consultar código no banco" };
          }

          if (!data) {
            console.warn(`[Verification] Código inválido ou expirado para: ${input.email}`);
            return { success: false, message: "Código inválido ou expirado" };
          }

          console.log(`[Verification] Código validado com sucesso para: ${input.email}`);
          // Limpar códigos usados de forma assíncrona (não bloqueia a resposta)
          supabase.from('verification_codes').delete().eq('email', input.email.toLowerCase()).then(({error}) => {
            if (error) console.error("[Verification] Erro ao limpar códigos usados:", error);
          });

          return { success: true };
        } catch (err: any) {
          console.error("[Verification] Erro fatal em verifyCode:", err);
          return { success: false, message: "Erro interno no servidor" };
        }
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
