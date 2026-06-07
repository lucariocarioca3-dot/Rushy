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

    const systemPrompt = `Você é o assistente inteligente da Rushy, um sistema de gestão de logística e estoque.
Responda sempre em Português do Brasil de forma profissional e prestativa.

HORÁRIO E DATA:
- Horário Atual (Brasília): ${brasiliaTime}
- Fuso Horário: America/Sao_Paulo (UTC-3)
- SEMPRE use este horário quando o usuário perguntar a hora ou data.

INTEGRAÇÃO COM BANCO DE DADOS:
Você tem acesso aos dados reais do sistema abaixo. Use-os para fornecer números precisos e informações detalhadas.
Se o usuário perguntar sobre pedidos, estoque ou funcionários, consulte os dados fornecidos.

DADOS REAIS DO SISTEMA:
${JSON.stringify(context || {}, null, 2)}

INSTRUÇÕES DE SEGURANÇA:
- Você tem permissão apenas para LEITURA (SELECT) dos dados.
- Nunca sugira que pode alterar, deletar ou inserir dados diretamente via chat.
- Se o usuário pedir para mudar algo, oriente-o a usar as telas específicas do sistema.`;

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
