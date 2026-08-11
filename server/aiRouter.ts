import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

// Migração da API do Google Gemini para a Groq (API OpenAI-compatível).
// A chave Gemini (formato AQ) estava bloqueada pela Google com erro 401
// UNAUTHENTICATED / ACCESS_TOKEN_TYPE_UNSUPPORTED.
// A Groq oferece plano gratuito permanente, sem cartão de crédito.

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

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
      const GROQ_API_KEY = process.env.GROQ_API_KEY;

      if (!GROQ_API_KEY) {
        return "Erro: Chave da IA não configurada.";
      }

      // Dados completos do contexto serializados no system prompt
      // (resumo no topo + dados detalhados embutidos)
      const dadosDoSistema = JSON.stringify(context ?? {}, null, 1);

      // Adicionar informações de horário para o assistente
      const now = new Date();
      const brasiliaTime = new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(now);

      const systemInstruction = `Você é o assistente inteligente da Rushy. 
Responda sempre em Português do Brasil.
Horário Atual (Brasília): ${brasiliaTime}.
Fuso Horário: America/Sao_Paulo (UTC-3).
Instrução Importante: Quando perguntarem a hora, use este horário de Brasília fornecido acima.

DADOS DO SISTEMA (JSON real, SOMENTE LEITURA — use estes dados para responder):
${dadosDoSistema}

REGRAS:
1. Responda perguntas usando EXCLUSIVAMENTE os dados acima.
2. Conte itens, liste quantidades, identifique produtos abaixo do mínimo, funcionários, fornecedores etc.
3. Se o dado não existir no JSON acima, diga educadamente que não há essa informação.
4. NUNCA invente dados.
5. SEGURANÇA: Apenas SELECT. Não altere dados. Se solicitado, direcione para as telas do sistema.`;

      const chatHistory = messages
        .filter(m => m.role !== "system")
        .map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }));

      try {
        const response = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: MODEL,
            messages: [
              { role: "system", content: systemInstruction },
              ...chatHistory,
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          console.error("Erro Groq:", data.error?.message || data);
          return `Erro na IA: ${data.error?.message || "falha na resposta"}`;
        }

        return data?.choices?.[0]?.message?.content || "Sem resposta.";
      } catch (error: any) {
        console.error("Erro Groq:", error.message);
        return `Erro na IA: ${error.message}`;
      }
    }),
});
