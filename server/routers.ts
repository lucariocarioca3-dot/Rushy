import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createClient } from '@supabase/supabase-js';
import axios from "axios";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const appRouter = router({
  system: systemRouter,
  ai: router({
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
        context: z.object({
          orders: z.array(z.any()).optional(),
          forms: z.array(z.any()).optional(),
          formResponses: z.array(z.any()).optional(),
          stockItems: z.array(z.any()).optional(),
          employees: z.array(z.any()).optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const { messages, context } = input;
        const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";

        if (!GEMINI_API_KEY) {
          return "⚠️ Chave do Gemini não configurada na Vercel.";
        }

        const systemPrompt = `Você é o Assistente da Rushy.
        Dados atuais:
        - Pedidos: ${JSON.stringify(context?.orders || [])}
        - Estoque: ${JSON.stringify(context?.stockItems || [])}
        - Formulários: ${JSON.stringify(context?.forms || [])}
        Responda em Português Brasileiro usando Markdown.`;

        const chatHistory = messages
          .filter(msg => msg.role !== "system")
          .map(msg => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }]
          }));

        try {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              contents: [
                { role: "user", parts: [{ text: `Instrução: ${systemPrompt}` }] },
                ...chatHistory
              ]
            }
          );
          return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
        } catch (error: any) {
          return `Erro na IA: ${error.message}`;
        }
      }),
  }),
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
