-- Tabela de Funcionários
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  join_date TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  total TEXT NOT NULL
);

-- Tabela de Estoque
CREATE TABLE IF NOT EXISTS stock_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL,
  unit TEXT NOT NULL,
  needs_restock BOOLEAN DEFAULT FALSE
);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Tabela de Formulários
CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  rows INTEGER NOT NULL,
  columns INTEGER NOT NULL,
  data JSONB NOT NULL
);

-- Inserir dados iniciais para não começar vazio
INSERT INTO employees (id, name, email, role, department, join_date, status)
VALUES 
('EMP-001', 'João Silva', 'joao@rushy.com', 'admin', 'Administração', '2023-01-15', 'ativo'),
('EMP-002', 'Pedro Lima', 'logistica@rushy.com', 'logistica', 'Logística', '2023-03-20', 'ativo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stock_items (id, name, category, quantity, min_quantity, unit, needs_restock)
VALUES 
('STK-001', 'Caixas de Papelão G', 'Embalagens', 150, 50, 'un', false),
('STK-002', 'Fita Adesiva 50mm', 'Suprimentos', 25, 30, 'rolos', true)
ON CONFLICT (id) DO NOTHING;
