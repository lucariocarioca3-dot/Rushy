-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SEU SUPABASE
-- Isso adicionará as colunas necessárias para a edição de perfil funcionar.

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Garantir que não há restrições de segurança impedindo a atualização (opcional se o RLS estiver desativado)
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;
