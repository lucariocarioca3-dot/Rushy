import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

// Configuração do Google Gemini
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
        return "Erro: A chave da API do Google Gemini não foi configurada nas variáveis de ambiente (GOOGLE_GEMINI_API_KEY).";
      }

      const systemPrompt = `Você é o Assistente Inteligente da Rushy, um sistema de gestão logística.
Sua função é ajudar o usuário a analisar dados do sistema, como pedidos, formulários, estoque e funcionários.

CONTEXTO ATUAL DO SISTEMA (ACESSO APENAS LEITURA):
${JSON.stringify(context || {}, null, 2)}

INSTRUÇÕES:
1. Responda de forma profissional, direta e útil em Português Brasileiro.
2. Use os dados fornecidos no contexto para responder perguntas como "quantos pedidos pendentes eu tenho".
3. Se o usuário pedir para resumir formulários, analise os dados em 'formResponses' e forneça um resumo conciso.
4. Se não houver dados no contexto para responder, informe educadamente que não encontrou essa informação.
5. Formate suas respostas usando Markdown para melhor legibilidade (use negrito, listas e tabelas se necessário).
6. Segurança: Você opera com permissões de SELECT apenas. Você não pode alterar dados.
`;

      // Converter mensagens para o formato do Gemini
      const contents = messages.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }));

      // Adicionar o system prompt como a primeira mensagem do usuário (instrução)
      contents.unshift({
        role: "user",
        parts: [{ text: `INSTRUÇÃO DE SISTEMA: ${systemPrompt}` }]
      });

      try {
        const response = await axios.post(GEMINI_URL, {
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        });

        const aiResponse = response.data.candidates[0].content.parts[0].text;
        return aiResponse;
      } catch (error: any) {
        console.error("Erro ao chamar Gemini:", error.response?.data || error.message);
        return "Olá! Ocorreu um erro ao processar sua solicitação com o Google Gemini. Verifique se a chave da API é válida e se há conexão com a internet.";
      }
    }),
});
