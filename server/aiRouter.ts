import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
        return "Erro: Chave GOOGLE_GEMINI_API_KEY não encontrada.";
      }

      // Simplificar contexto para evitar estouro de payload
      const simplifiedContext = {
        pedidos_count: context?.orders?.length || 0,
        estoque_count: context?.stockItems?.length || 0,
        formularios_count: context?.forms?.length || 0,
        recent_orders: context?.orders?.slice(0, 5).map((o: any) => ({ p: o.product, s: o.status })),
      };

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                role: "user",
                parts: [{ text: `Contexto do Sistema: ${JSON.stringify(simplifiedContext)}` }]
              },
              ...messages.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
              }))
            ]
          }
        );
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
      } catch (error: any) {
        console.error("Erro Gemini:", error.message);
        return `Erro na IA: ${error.message}`;
      }
    }),
});
