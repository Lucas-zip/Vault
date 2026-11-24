-- ============================================
-- Vault - Migration V10: Limite mensal de gastos
-- ============================================
-- Um único orçamento (limite total de despesas) por usuário e período (YYYY-MM).
-- Diferente de "budgets" (por categoria), este representa o teto geral do mês.

CREATE TABLE monthly_budgets (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    period           VARCHAR(7) NOT NULL,  -- formato 'YYYY-MM'
    limit_amount     DECIMAL(19,2) NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_monthly_budgets_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_monthly_budgets_limit_positive CHECK (limit_amount > 0),
    CONSTRAINT ck_monthly_budgets_period_format CHECK (period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

CREATE UNIQUE INDEX uk_monthly_budgets_user_period ON monthly_budgets (user_id, period);
CREATE INDEX idx_monthly_budgets_user_id ON monthly_budgets (user_id);

COMMENT ON TABLE monthly_budgets IS 'Limite mensal total de gastos por usuário';
