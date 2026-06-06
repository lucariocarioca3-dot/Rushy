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

    // Usando a versão estável v1 e o modelo correto
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    const systemPrompt = `Você é o assistente da Rushy. Responda em Português. Dados: ${JSON.stringify(context || {})}`;

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
