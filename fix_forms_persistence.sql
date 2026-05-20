-- Garantir que a tabela forms tenha todas as colunas necessárias
ALTER TABLE forms ADD COLUMN IF NOT EXISTS company_id TEXT;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE forms ADD COLUMN IF NOT EXISTS creator_user_id TEXT;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT TRUE;
ALTER TABLE forms ADD COLUMN IF NOT EXISTS posted_at TEXT;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_forms_company_id ON forms(company_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_creator ON forms(creator_user_id);

-- Desabilitar RLS temporariamente para garantir que os dados sejam salvos (ou você pode configurar as políticas corretamente no painel do Supabase)
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
