-- Adicionar colunas para controle de login e bloqueio
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lockout_until TIMESTAMPTZ;

-- Comentário informativo
COMMENT ON COLUMN users.login_attempts IS 'Número de tentativas de login falhas consecutivas';
COMMENT ON COLUMN users.lockout_until IS 'Data e hora até quando a conta está bloqueada';
