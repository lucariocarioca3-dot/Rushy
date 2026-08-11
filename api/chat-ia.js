export const config = {
  runtime: 'edge',
};

// Migração da API do Google Gemini para a Groq (API OpenAI-compatível).
// A chave Gemini (formato AQ) estava bloqueada pela Google com erro 401
// UNAUTHENTICATED / ACCESS_TOKEN_TYPE_UNSUPPORTED.
// A Groq free tier tem limite de 12.000 tokens/min (TPM) no modelo
// llama-3.3-70b-versatile: por isso o contexto é enviado comprimido e
// há fallback automático para um resumo menor se o TPM for excedido.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Formato compacto do contexto enviado pelo cliente (AIChat.tsx):
// { p: [[cliente,produto,qtd,un,status,data,total,urg,solicitado_por,obs]],
//   e: [[nome,categoria,qtd,min,un,abaixo_minimo,local]],
//   f: [[nome,cargo,departamento,admissao,status]],
//   s: [[nome,contato,categoria,status]],
//   fm: [[titulo,status,criador,publicado]] }

/**
 * Converte o contexto compacto em um texto legível e compacto
 * para reduzir a contagem de tokens no prompt do sistema.
 */
function formatarContextoCompacto(ctx) {
  if (!ctx) return 'Nenhum dado disponível.';
  const linhas = [];
  if (ctx.p?.length) {
    linhas.push('PEDIDOS [cliente|produto|qtd|un|status|data|total|urgencia|solicitante|obs]:');
    ctx.p.forEach(r => linhas.push('  ' + r.join('|')));
  }
  if (ctx.e?.length) {
    linhas.push('ESTOQUE [nome|categoria|qtd|qtd_minima|un|abaixo_minimo|local]:');
    ctx.e.forEach(r => linhas.push('  ' + r.join('|')));
  }
  if (ctx.f?.length) {
    linhas.push('FUNCIONARIOS [nome|cargo|departamento|admissao|status]:');
    ctx.f.forEach(r => linhas.push('  ' + r.join('|')));
  }
  if (ctx.s?.length) {
    linhas.push('FORNECEDORES [nome|contato|categoria|status]:');
    ctx.s.forEach(r => linhas.push('  ' + r.join('|')));
  }
  if (ctx.fm?.length) {
    linhas.push('FORMULARIOS [titulo|status|criador|publicado]:');
    ctx.fm.forEach(r => linhas.push('  ' + r.join('|')));
  }
  return linhas.join('\n') || 'Nenhum dado disponível.';
}

/**
 * Resposta de emergência quando tudo falha (sem dados nem IA).
 */
function resumoFallback(ctx) {
  const n = (a) => (Array.isArray(a) ? a.length : 0);
  const sum = (arr) => (Array.isArray(arr) ? arr.filter(r => r[5]).length : 0);
  return {
    p: n(ctx?.p),
    e: n(ctx?.e),
    eBaixo: sum(ctx?.e),
    f: n(ctx?.f),
    s: n(ctx?.s),
    fm: n(ctx?.fm),
  };
}

function buildSystemPrompt(brasiliaTime, dados) {
  return `Você é o assistente inteligente da Rushy.
Responda sempre em Português do Brasil.
Horário Atual (Brasília): ${brasiliaTime}.
Fuso Horário: America/Sao_Paulo (UTC-3).
Instrução Importante: Quando perguntarem a hora, use este horário de Brasília fornecido acima.

DADOS DO SISTEMA (SOMENTE LEITURA — use exclusivamente estes dados para responder):
${dados}

REGRAS:
1. Responda perguntas usando EXCLUSIVAMENTE os dados acima.
2. Conte itens, liste quantidades, identifique produtos abaixo do mínimo, funcionários, fornecedores etc.
3. Se o dado não existir acima, diga educadamente que não há essa informação.
4. NUNCA invente dados.
5. SEGURANÇA: Apenas SELECT. Não altere dados. Se solicitado, direcione para as telas do sistema.`;
}

function buildBody(systemInstruction, chatHistory, maxTokens = 1024) {
  return {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemInstruction }, ...chatHistory],
    temperature: 0.7,
    max_tokens: maxTokens
  };
}

async function chamarGroq(GROQ_API_KEY, payload) {
  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return { res, data };
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { messages, context } = await req.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: 'Chave da IA não configurada.' }), { status: 500 });
    }

    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }));

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

    const dadosCompletos = formatarContextoCompacto(context);

    // Tentativa 1: prompt completo (compacto). Se estourar o TPM da Groq
    // free tier (12.000 tokens/min), tenta com resposta curta + apenas o
    // resumo numérico (fallback). Se ainda falhar, retorna o resumo gerado
    // deterministicamente.
    let { res, data } = await chamarGroq(GROQ_API_KEY, buildBody(buildSystemPrompt(brasiliaTime, dadosCompletos), chatHistory));

    const isRateOrSizeError = data?.error &&
      (res.status === 413 || res.status === 429 ||
        /too large|rate limit|per minute|TPM/i.test(data.error.message || ''));

    if (isRateOrSizeError) {
      console.warn('Groq: TPM/size excedido, tentando fallback com resumo curto');
      const resumo = resumoFallback(context);
      const resumoTexto =
        `PEDIDOS: ${resumo.p} | ESTOQUE: ${resumo.e} itens (${resumo.eBaixo} abaixo do minimo) | FUNCIONARIOS: ${resumo.f} | FORNECEDORES: ${resumo.s} | FORMULARIOS: ${resumo.fm}`;
      ({ res, data } = await chamarGroq(
        GROQ_API_KEY,
        buildBody(buildSystemPrompt(brasiliaTime, resumoTexto), chatHistory, 512)
      ));
    }

    if (!res.ok || data.error) {
      const msg = data?.error?.message || 'Erro na API de IA';
      console.error('Erro Groq:', msg);
      // Último recurso: resposta determinística com os números do contexto
      const resumo = resumoFallback(context);
      const textoFallback =
        `Não consegui processar sua mensagem no momento (limite de uso da IA atingido). Resumo atual do sistema: ${resumo.p} pedidos, ${resumo.e} itens em estoque (${resumo.eBaixo} abaixo do mínimo), ${resumo.f} funcionários e ${resumo.s} fornecedores.`;
      return new Response(JSON.stringify({ text: textoFallback }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    const text = data?.choices?.[0]?.message?.content || "Sem resposta.";

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro no handler chat-ia:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
