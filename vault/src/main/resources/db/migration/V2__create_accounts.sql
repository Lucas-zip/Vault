-- ============================================
-- Vault - Migration V2: Criação da tabela accounts
-- ============================================

CREATE TABLE accounts (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL,
    name             VARCHAR(120) NOT NULL,
    type             VARCHAR(20) NOT NULL,
    initial_balance  DECIMAL(19,2) NOT NULL DEFAULT 0,
    current_balance  DECIMAL(19,2) NOT NULL DEFAULT 0,
    institution      VARCHAR(120),
    description      VARCHAR(255),
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);

COMMENT ON TABLE accounts IS 'Contas financeiras dos usuários (corrente, poupança, carteira, etc.)';
