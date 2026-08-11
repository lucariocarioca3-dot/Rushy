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

      // Contexto em formato compacto (linhas separadas por |) para caber no
      // limite de 12.000 TPM do Groq free tier. Formato vindo do cliente:
      // { p: [arr], e: [arr], f: [arr], s: [arr], fm: [arr] }
      function formatarContextoCompacto(ctx: any): string {
        if (!ctx) return 'Nenhum dado disponível.';
        const linhas: string[] = [];
        if (ctx.p?.length) {
          linhas.push('PEDIDOS [cliente|produto|qtd|un|status|data|total|urgencia|solicitante|obs]:');
          ctx.p.forEach((r: any[]) => linhas.push('  ' + r.join('|')));
        }
        if (ctx.e?.length) {
          linhas.push('ESTOQUE [nome|categoria|qtd|qtd_minima|un|abaixo_minimo|local]:');
          ctx.e.forEach((r: any[]) => linhas.push('  ' + r.join('|')));
        }
        if (ctx.f?.length) {
          linhas.push('FUNCIONARIOS [nome|cargo|departamento|admissao|status]:');
          ctx.f.forEach((r: any[]) => linhas.push('  ' + r.join('|')));
        }
        if (ctx.s?.length) {
          linhas.push('FORNECEDORES [nome|contato|categoria|status]:');
          ctx.s.forEach((r: any[]) => linhas.push('  ' + r.join('|')));
        }
        if (ctx.fm?.length) {
          linhas.push('FORMULARIOS [titulo|status|criador|publicado]:');
          ctx.fm.forEach((r: any[]) => linhas.push('  ' + r.join('|')));
        }
        return linhas.join('\n') || 'Nenhum dado disponível.';
      }

      const dadosDoSistema = formatarContextoCompacto(context);

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

DADOS DO SISTEMA (SOMENTE LEITURA — use exclusivamente estes dados para responder):
${dadosDoSistema}

REGRAS:
1. Responda perguntas usando EXCLUSIVAMENTE os dados acima.
2. Conte itens, liste quantidades, identifique produtos abaixo do mínimo, funcionários, fornecedores etc.
3. Se o dado não existir acima, diga educadamente que não há essa informação.
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

        const isRateOrSizeError = data?.error &&
          (response.status === 413 || response.status === 429 ||
            /too large|rate limit|per minute|TPM/i.test(data.error.message || ""));

        if (isRateOrSizeError) {
          // Fallback: TPM/size excedido (12.000 tokens/min no free tier).
          // Tenta novamente apenas com o resumo numérico e resposta curta.
          const n = (a: any) => (Array.isArray(a) ? a.length : 0);
          const sum = (arr: any) => (Array.isArray(arr) ? arr.filter((r: any) => r[5]).length : 0);
          const resumoTexto =
            `PEDIDOS: ${n(context?.p)} | ESTOQUE: ${n(context?.e)} itens (${sum(context?.e)} abaixo do minimo) | FUNCIONARIOS: ${n(context?.f)} | FORNECEDORES: ${n(context?.s)} | FORMULARIOS: ${n(context?.fm)}`;
          const retryRes = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                { role: "system", content: systemInstruction.replace(dadosDoSistema, resumoTexto) },
                ...chatHistory,
              ],
              temperature: 0.7,
              max_tokens: 512,
            }),
          });
          const retryData = await retryRes.json();
          if (retryRes.ok && !retryData.error) {
            return retryData?.choices?.[0]?.message?.content || "Sem resposta.";
          }
          // Último recurso: resumo determinístico sem IA
          return `Não consegui processar sua mensagem no momento (limite de uso da IA atingido). Resumo atual: ${resumoTexto}.`;
        }

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
