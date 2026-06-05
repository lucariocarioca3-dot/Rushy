import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

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

      const systemPrompt = `Você é o Assistente Inteligente da Rushy, um sistema de gestão logística.
Sua função é ajudar o usuário a analisar dados do sistema, como pedidos, formulários, estoque e funcionários.

CONTEXTO ATUAL DO SISTEMA:
${JSON.stringify(context || {}, null, 2)}

INSTRUÇÕES:
1. Responda de forma profissional, direta e útil em Português Brasileiro.
2. Use os dados fornecidos no contexto para responder perguntas como "quantos pedidos pendentes eu tenho".
3. Se o usuário pedir para resumir formulários, analise os dados em 'formResponses' e forneça um resumo conciso.
4. Se não houver dados no contexto para responder, informe educadamente que não encontrou essa informação.
5. Formate suas respostas usando Markdown para melhor legibilidade (use negrito, listas e tabelas se necessário).
6. Seja proativo: se notar algo crítico (como estoque muito baixo ou muitos pedidos atrasados), mencione brevemente.

Exemplos de consultas que você deve lidar:
- "Quantos pedidos pendentes eu tenho?" -> Conte pedidos com status 'pendente'.
- "Quantos formulários tem?" -> Conte os itens em 'forms'.
- "Resuma os formulários" -> Analise as respostas em 'formResponses' e faça um resumo dos temas ou dados principais.
- "Como está meu estoque?" -> Verifique itens com 'needsRestock: true'.
`;

      const allMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages
      ];

      const response = await invokeLLM({
        messages: allMessages,
      });

      return response.content;
    }),
});
