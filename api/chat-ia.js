export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  try {
    const { messages, context } = await req.json();
    const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Chave Gemini não configurada.' }), { status: 500 });
    }

    // Usando o modelo gemini-2.0-flash conforme solicitado (mantendo na linha 2.0+)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
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

    const systemPrompt = `Assistente Rushy (Logística/Estoque). Responda em PT-BR.
HORA BRASÍLIA: ${brasiliaTime}. Use SEMPRE esta hora.
DADOS (Apenas Leitura): ${JSON.stringify(context || {})}
SEGURANÇA: Apenas SELECT. Não altere dados. Se solicitado, direcione para as telas do sistema.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `Instrução: ${systemPrompt}` }] },
          ...chatHistory
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
    
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
