-- 1. LIMPEZA TOTAL
DROP TABLE IF EXISTS pending_requests CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS forms CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS stock_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 2. CRIAÇÃO DAS TABELAS UNIFICADAS

-- Empresas
CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Usuários
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL, -- admin, gerente, logistica, estoque
  company TEXT,
  company_id TEXT REFERENCES companies(id),
  status TEXT DEFAULT 'ativo', -- ativo, inativo
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Solicitações de Cadastro
CREATE TABLE pending_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  company_id TEXT REFERENCES companies(id),
  status TEXT DEFAULT 'pendente', -- pendente, aceito, recusado
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funcionários (Para a tela de Funcionários)
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  join_date TEXT NOT NULL,
  status TEXT DEFAULT 'ativo',
  company_id TEXT REFERENCES companies(id)
);

-- Pedidos
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer TEXT,
  product TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT DEFAULT 'un',
  date TEXT NOT NULL,
  status TEXT NOT NULL, -- pendente, em_transito, entregue, cancelado
  total TEXT,
  urgency TEXT DEFAULT 'media', -- baixa, media, alta
  requested_by TEXT,
  comments TEXT,
  company_id TEXT REFERENCES companies(id)
);

-- Estoque
CREATE TABLE stock_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  min_quantity INTEGER DEFAULT 0,
  unit TEXT NOT NULL,
  needs_restock BOOLEAN DEFAULT FALSE,
  description TEXT,
  company_id TEXT REFERENCES companies(id)
);

-- Fornecedores
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  email TEXT,
  phone TEXT,
  cnpj TEXT,
  category TEXT,
  status TEXT DEFAULT 'ativo',
  company_id TEXT REFERENCES companies(id)
);

-- Formulários
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  rows INTEGER DEFAULT 10,
  columns INTEGER DEFAULT 5,
  data JSONB DEFAULT '[]',
  company_id TEXT REFERENCES companies(id)
);

-- Notificações
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- info, alerta, sucesso
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  user_id TEXT, -- Notificação específica para um usuário
  company_id TEXT REFERENCES companies(id)
);

-- 3. DADOS INICIAIS (Opcional, mas ajuda no primeiro acesso)
INSERT INTO companies (id, name, cnpj) VALUES ('COMP-001', 'Rushy Logística Master', '00.000.000/0001-00');
INSERT INTO users (id, name, email, password, role, company, company_id) 
VALUES ('USR-ADMIN', 'Gerente Master', 'gerente@rushy.com', '123456', 'gerente', 'Rushy Logística Master', 'COMP-001');

-- 4. DESABILITAR RLS PARA TESTES (Garante que tudo funcione sem erro de permissão)
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE pending_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
