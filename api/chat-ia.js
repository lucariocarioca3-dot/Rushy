export const config = {
  runtime: 'edge',
};

// Migração da API do Google Gemini para a Groq (API OpenAI-compatível).
// A chave Gemini (formato AQ) estava bloqueada pela Google com erro 401
// UNAUTHENTICATED / ACCESS_TOKEN_TYPE_UNSUPPORTED.
// A Groq oferece plano gratuito permanente, sem cartão de crédito.

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

    // Modelo Groq: Llama 3.3 70B (rápido e gratuito, limite generoso)
    const MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }));

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

    // systemInstruction mantida do código anterior
    const systemInstruction = `Você é o assistente inteligente da Rushy. 
Responda sempre em Português do Brasil.
Horário Atual (Brasília): ${brasiliaTime}.
Fuso Horário: America/Sao_Paulo (UTC-3).
Instrução Importante: Quando perguntarem a hora, use este horário de Brasília fornecido acima.
SEGURANÇA: Apenas SELECT. Não altere dados. Se solicitado, direcione para as telas do sistema.

Contexto do Sistema (resumo):
- Pedidos: ${context?.resumo?.total_pedidos ?? context?.orders_count ?? 0}
- Itens em estoque: ${context?.resumo?.total_itens_estoque ?? context?.stock_count ?? 0}
- Formulários: ${context?.resumo?.total_formularios ?? context?.forms_count ?? 0}`;

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemInstruction },
          ...chatHistory
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      const msg = data.error?.message || 'Erro na API de IA';
      console.error('Erro Groq:', msg);
      return new Response(JSON.stringify({ error: msg }), { status: response.status || 500 });
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
