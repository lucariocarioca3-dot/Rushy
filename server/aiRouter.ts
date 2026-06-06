import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

// Configuração do Google Gemini
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";

export const aiRouter = router({
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

      if (!GEMINI_API_KEY) {
        console.error("[AI] Erro: GOOGLE_GEMINI_API_KEY não configurada.");
        return "Erro: A chave da API do Google Gemini não foi encontrada. Verifique as variáveis de ambiente na Vercel.";
      }

      const systemPrompt = `Você é o Assistente Inteligente da Rushy, um sistema de gestão logística.
Sua função é ajudar o usuário a analisar dados do sistema, como pedidos, formulários, estoque e funcionários.

CONTEXTO ATUAL DO SISTEMA (ACESSO APENAS LEITURA):
- Pedidos: ${context?.orders?.length || 0} encontrados.
- Formulários: ${context?.forms?.length || 0} encontrados.
- Respostas de Formulários: ${context?.formResponses?.length || 0} encontradas.
- Itens em Estoque: ${context?.stockItems?.length || 0} encontrados.
- Funcionários: ${context?.employees?.length || 0} encontrados.

DADOS DETALHADOS:
${JSON.stringify(context || {}, null, 2)}

INSTRUÇÕES:
1. Responda em Português Brasileiro.
2. Seja direto e use os dados acima para responder.
3. Se o usuário perguntar "quantos pedidos pendentes", conte os pedidos com status 'pendente' nos dados fornecidos.
4. Formate com Markdown.
`;

      // Formatar mensagens para o Gemini (removendo mensagens do sistema do histórico de chat)
      const chatHistory = messages
        .filter(msg => msg.role !== "system")
        .map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }));

      // A última mensagem deve ser do usuário para o Gemini gerar uma resposta
      if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "model") {
        chatHistory.push({ role: "user", parts: [{ text: "Continue." }] });
      }

      try {
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: chatHistory,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return response.data.candidates[0].content.parts[0].text;
        }
        
        return "A IA recebeu a mensagem, mas não gerou uma resposta de texto. Verifique se há filtros de segurança ativos.";
      } catch (error: any) {
        const errorData = error.response?.data;
        console.error("[AI] Erro na API do Gemini:", JSON.stringify(errorData || error.message));
        
        if (errorData?.error?.message?.includes("API key not valid")) {
          return "Erro: A chave da API do Gemini é inválida. Por favor, gere uma nova chave no Google AI Studio.";
        }
        
        return `Erro ao falar com a IA: ${errorData?.error?.message || error.message}. Verifique se a chave da API está correta na Vercel.`;
      }
    }),
});
