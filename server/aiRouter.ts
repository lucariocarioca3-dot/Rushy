import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

export const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
      })),
      context: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const { messages, context } = input;
      const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

      if (!GEMINI_API_KEY) {
        return "Erro: Chave GOOGLE_GEMINI_API_KEY não configurada na Vercel.";
      }

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: messages.map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            }))
          }
        );
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta da IA.";
      } catch (error: any) {
        return `Erro na API: ${error.message}`;
      }
    }),
});
