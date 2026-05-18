CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT
);

-- Inserir a empresa padrão
INSERT INTO companies (id, name, cnpj, created_at, created_by)
VALUES ('COMP-001', 'Rushy Logística Ltda', '12.345.678/0001-90', '2025-01-01', 'USR-ADMIN')
ON CONFLICT (cnpj) DO NOTHING;

ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
