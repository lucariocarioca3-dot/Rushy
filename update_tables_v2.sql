-- Adicionar colunas extras para Fornecedores
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone TEXT;

-- Adicionar colunas extras para Pedidos
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS urgency TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS requested_by TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS comments TEXT;

-- Adicionar colunas extras para Estoque
ALTER TABLE stock_items ADD COLUMN IF NOT EXISTS description TEXT;
