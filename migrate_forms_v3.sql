-- Migração: Adicionar suporte para Modelos, Rascunhos e Postados
-- Adiciona campos necessários para gerenciar o fluxo de formulários

ALTER TABLE forms ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
-- status: 'template' (modelo pré-feito), 'draft' (rascunho privado), 'posted' (postado para empresa)

ALTER TABLE forms ADD COLUMN IF NOT EXISTS creator_user_id TEXT;
-- Rastreia quem criou o formulário para validar permissões de edição

ALTER TABLE forms ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT TRUE;
-- Controla se o formulário pode ser editado (FALSE quando postado)

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_creator ON forms(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_forms_company_status ON forms(company_id, status);
