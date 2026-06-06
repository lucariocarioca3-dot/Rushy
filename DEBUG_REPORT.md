# Relatório de Diagnóstico - Chat IA Rushy

Este relatório analisa os possíveis motivos para o erro 405/500 no Chat IA e como corrigi-los.

## 1. Possíveis Causas Técnicas

### A. Roteamento da Vercel (Causa Provável do 405)
A Vercel, por padrão, tenta servir arquivos estáticos. Quando adicionamos uma nova rota de API (`/api/trpc/ai.chat`), se o arquivo `vercel.json` não estiver perfeito, ela recusa o método `POST`.
*   **Status:** Corrigido no último commit com roteamento universal.

### B. Serialização SuperJSON (Causa Provável do 500)
O projeto usa `superjson` para transformar dados (como datas e objetos complexos) entre o cliente e o servidor. Se o servidor tentar responder com algo que o `superjson` não entende, ele gera um erro de sintaxe JSON.
*   **Ação:** Removi o `superjson` da rota de IA para usar JSON puro, que é mais estável.

### C. Limite de Tamanho de Payload (Causa Provável do 500)
Ao enviar **todos** os pedidos, estoque e formulários no "contexto", o tamanho da mensagem pode ultrapassar o limite da Vercel (4.5MB).
*   **Ação:** Reduzi o contexto para enviar apenas os nomes e status essenciais.

### D. Chave de API Inválida ou Ausente
Se a `GOOGLE_GEMINI_API_KEY` não estiver salva ou tiver espaços extras, o Google recusa a conexão.
*   **Ação:** Adicionei logs no backend para validar a chave antes de enviar.

## 2. Como resolver agora (Plano de Ação)

Vou aplicar uma mudança radical para garantir o funcionamento:
1.  **Remover SuperJSON da IA:** Usar apenas tipos primitivos.
2.  **Reduzir Contexto:** Enviar apenas o resumo dos dados.
3.  **Log de Servidor:** Forçar a Vercel a mostrar o erro real no console.

## 3. Verificação do Usuário
Por favor, verifique no seu painel da Vercel (aba Logs) se aparece alguma mensagem de erro quando você tenta enviar a mensagem. Isso nos daria a resposta definitiva.
