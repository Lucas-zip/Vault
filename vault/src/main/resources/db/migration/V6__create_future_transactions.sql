-- ============================================
-- Vault - Migration V6: Criação da tabela future_transactions
-- (Contas a pagar e a receber)
-- ============================================

CREATE TABLE future_transactions (
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT NOT NULL,
    account_id     BIGINT,
    category_id    BIGINT,
    recurrence_id  BIGINT,
    description    VARCHAR(255) NOT NULL,
    amount         DECIMAL(19,2) NOT NULL,
    due_date       DATE NOT NULL,
    type           VARCHAR(20) NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_future_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_future_account
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE SET NULL,
    CONSTRAINT fk_future_category
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT fk_future_recurrence
        FOREIGN KEY (recurrence_id) REFERENCES recurrences (id) ON DELETE SET NULL,
    CONSTRAINT ck_future_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_future_user_id ON future_transactions (user_id);
CREATE INDEX idx_future_user_status ON future_transactions (user_id, status);
CREATE INDEX idx_future_user_due ON future_transactions (user_id, due_date);

COMMENT ON TABLE future_transactions IS 'Contas a pagar e a receber com vencimento e status';
