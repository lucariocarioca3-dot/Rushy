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
      return new Response(JSON.stringify({ error: 'Chave Gemini não configurada na Vercel.' }), { status: 500 });
    }

    // Filtrar e formatar mensagens corretamente para o Gemini
    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    const systemInstruction = `Você é o assistente inteligente da Rushy. 
    Responda em Português Brasileiro. 
    Dados do sistema: ${JSON.stringify(context || {})}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `Instrução Inicial: ${systemInstruction}` }] },
            ...chatHistory
          ]
        })
      }
    );

    const data = await response.json();
    
    // Log detalhado no servidor da Vercel para depuração se necessário
    console.log("Gemini Response Status:", response.status);

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 500 });
    }

    // Tentar extrair o texto de várias formas possíveis que o Gemini retorna
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                 data?.candidates?.[0]?.text || 
                 "A IA processou a mensagem, mas não gerou um texto. Tente perguntar algo mais específico.";
    
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
