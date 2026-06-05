-- Criar usuário para a IA com permissões apenas de leitura
2	-- Nota: Em ambientes como Supabase, as permissões são geridas via RLS ou usuários de banco específicos.
3	-- Para MySQL local ou RDS:
4	-- CREATE USER 'ai_reader'@'%' IDENTIFIED BY 'ai_reader_password_safe';
5	-- GRANT SELECT ON rushy.* TO 'ai_reader'@'%';
6	-- FLUSH PRIVILEGES;
7	
8	-- Como o projeto usa Supabase, a segurança é garantida via políticas de RLS.
9	-- No entanto, para simular o pedido do usuário de um "usuário MySQL exclusivo",
10	-- vamos definir que o backend usará uma connection string específica se disponível.
11	
12	-- Se estiver usando PostgreSQL/Supabase:
13	-- CREATE ROLE ai_reader WITH LOGIN PASSWORD 'ai_reader_password_safe';
14	-- GRANT CONNECT ON DATABASE postgres TO ai_reader;
15	-- GRANT USAGE ON SCHEMA public TO ai_reader;
16	-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO ai_reader;
17	-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO ai_reader;
18	
