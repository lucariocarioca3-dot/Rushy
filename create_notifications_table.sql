CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE
);

-- Inserir algumas notificações de exemplo
INSERT INTO notifications (id, title, message, type, created_at, read)
VALUES 
('NOT-001', 'Estoque Baixo', 'O item Fita Adesiva está abaixo da quantidade mínima.', 'alerta', '2026-05-06T10:00:00Z', false),
('NOT-002', 'Novo Pedido', 'Um novo pedido foi criado por João Silva.', 'info', '2026-05-06T11:30:00Z', false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
