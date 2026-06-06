import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

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

      // Tentar pegar a chave de várias formas possíveis
      const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || 
                             process.env.VITE_GOOGLE_GEMINI_API_KEY || 
                             "";

      if (!GEMINI_API_KEY) {
        return "⚠️ Erro de Configuração: A chave 'GOOGLE_GEMINI_API_KEY' não foi encontrada nas variáveis de ambiente da Vercel. Por favor, verifique se você salvou a chave corretamente nas configurações do projeto.";
      }

      const systemPrompt = `Você é o Assistente Inteligente da Rushy.
Responda sempre em Português Brasileiro de forma profissional.
Você tem acesso aos seguintes dados:
- Pedidos: ${JSON.stringify(context?.orders || [])}
- Formulários: ${JSON.stringify(context?.forms || [])}
- Respostas: ${JSON.stringify(context?.formResponses || [])}
- Estoque: ${JSON.stringify(context?.stockItems || [])}
- Funcionários: ${JSON.stringify(context?.employees || [])}

Use esses dados para responder o usuário. Se ele perguntar algo que não está nos dados, diga que não tem essa informação no momento.`;

      // Formato simplificado para evitar erros de validação do Gemini
      const chatHistory = messages
        .filter(msg => msg.role !== "system")
        .map(msg => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }]
        }));

      try {
        const response = await axios({
          method: 'post',
          url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          data: {
            contents: [
              {
                role: "user",
                parts: [{ text: `Instrução de Sistema: ${systemPrompt}` }]
              },
              ...chatHistory
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            }
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 segundos de timeout
        });

        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
        
        return "A IA respondeu, mas o formato do texto está vazio. Tente perguntar de outra forma.";
      } catch (error: any) {
        console.error("[GEMINI ERROR]", error.response?.data || error.message);
        
        if (error.response?.status === 403 || error.response?.status === 400) {
          return `❌ Erro na API (403/400): Verifique se a sua chave do Gemini está correta e se o modelo 'gemini-1.5-flash' está disponível na sua região. Detalhe: ${error.response?.data?.error?.message || "Erro desconhecido"}`;
        }
        
        return `❌ Falha na conexão com a IA: ${error.message}. Isso pode ser um problema temporário nos servidores do Google ou na rede da Vercel.`;
      }
    }),
});
