-- ============================================
-- Vault - Migration V1: Criação da tabela users
-- ============================================

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    cpf_cnpj        VARCHAR(20),
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'USER',
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX uk_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

COMMENT ON TABLE users IS 'Usuários do sistema financeiro Vault';
