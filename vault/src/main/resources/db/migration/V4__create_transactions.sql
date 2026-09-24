-- ============================================
-- Vault - Migration V4: Criação da tabela transactions
-- ============================================

CREATE TABLE transactions (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    account_id       BIGINT NOT NULL,
    category_id      BIGINT,
    description      VARCHAR(255) NOT NULL,
    amount           DECIMAL(19,2) NOT NULL,
    type             VARCHAR(20) NOT NULL,
    transaction_date DATE NOT NULL,
    observation      TEXT,
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT ck_transactions_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_transactions_user_id ON transactions (user_id);
CREATE INDEX idx_transactions_user_date ON transactions (user_id, transaction_date);
CREATE INDEX idx_transactions_account_id ON transactions (account_id);
CREATE INDEX idx_transactions_category_id ON transactions (category_id);

COMMENT ON TABLE transactions IS 'Transações financeiras: receitas e despesas que impactam o saldo das contas';
