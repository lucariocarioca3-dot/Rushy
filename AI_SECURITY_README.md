# Configuração de IA Segura - Rushy

Este documento detalha as medidas de segurança e a infraestrutura implementada para o Chat de IA da Rushy.

## 1. Modelo Local (Ollama)
O sistema foi migrado para utilizar o **Ollama**, um motor de IA que roda localmente. Isso garante que:
- Seus dados não saiam da sua infraestrutura.
- Não haja custos de API por mensagem.
- Maior privacidade e controle sobre o modelo utilizado (Padrão: `llama3`).

## 2. Acesso Restrito ao Banco de Dados (SELECT Only)
Para evitar que a IA possa apagar ou modificar dados acidentalmente ou por "alucinação", implementamos uma camada de segurança rigorosa:

### Camada de Aplicação
O `aiRouter.ts` recebe apenas um **snapshot de contexto** enviado pelo frontend. Esse contexto é montado a partir de consultas de leitura já existentes no sistema.

### Camada de Banco de Dados (Recomendado)
Para uma segurança completa, recomendamos a criação de um usuário de banco de dados exclusivo para a IA. 

#### SQL para MySQL:
```sql
CREATE USER 'ai_reader'@'%' IDENTIFIED BY 'sua_senha_segura';
GRANT SELECT ON rushy.* TO 'ai_reader'@'%';
FLUSH PRIVILEGES;
```

#### SQL para PostgreSQL/Supabase:
```sql
CREATE ROLE ai_reader WITH LOGIN PASSWORD 'sua_senha_segura';
GRANT CONNECT ON DATABASE postgres TO ai_reader;
GRANT USAGE ON SCHEMA public TO ai_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_reader;
```

## 3. Como Rodar o Ollama
Certifique-se de que o Ollama está instalado e rodando:
1. Instale o Ollama em [ollama.com](https://ollama.com).
2. Execute o comando: `ollama run llama3`.
3. O backend da Rushy se conectará automaticamente via `http://localhost:11434`.
