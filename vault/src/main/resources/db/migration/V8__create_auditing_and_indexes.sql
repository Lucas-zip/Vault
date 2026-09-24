-- ============================================
-- Vault - Migration V8: Ajustes finais e índices de otimização
-- ============================================

-- Índices compostos para relatórios financeiros (filtros por período + tipo)
CREATE INDEX idx_transactions_user_type_date
    ON transactions (user_id, type, transaction_date);

CREATE INDEX idx_transactions_user_category_date
    ON transactions (user_id, category_id, transaction_date);

-- Índice para contas vencidas (queries de dashboard)
CREATE INDEX idx_future_user_status_due
    ON future_transactions (user_id, status, due_date);

COMMENT ON INDEX idx_transactions_user_type_date IS 'Otimiza relatórios que filtram por tipo e período';
COMMENT ON INDEX idx_future_user_status_due IS 'Otimiza consultas de contas por status e vencimento';
