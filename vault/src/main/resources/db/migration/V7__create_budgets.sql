-- ============================================
-- Vault - Migration V7: Criação da tabela budgets
-- ============================================

CREATE TABLE budgets (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    category_id      BIGINT NOT NULL,
    limit_amount     DECIMAL(19,2) NOT NULL,
    period           VARCHAR(7) NOT NULL,  -- formato 'YYYY-MM'
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,
    CONSTRAINT ck_budgets_limit_positive CHECK (limit_amount > 0),
    CONSTRAINT ck_budgets_period_format CHECK (period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$')
);

CREATE INDEX idx_budgets_user_id ON budgets (user_id);
CREATE UNIQUE INDEX uk_budgets_user_category_period ON budgets (user_id, category_id, period);

COMMENT ON TABLE budgets IS 'Orçamentos mensais por categoria';
