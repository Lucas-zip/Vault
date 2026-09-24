-- ============================================
-- Vault - Migration V5: Criação da tabela recurrences
-- ============================================

CREATE TABLE recurrences (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    account_id   BIGINT NOT NULL,
    category_id  BIGINT,
    description  VARCHAR(255) NOT NULL,
    amount       DECIMAL(19,2) NOT NULL,
    type         VARCHAR(20) NOT NULL,
    frequency    VARCHAR(20) NOT NULL,
    start_date   DATE NOT NULL,
    end_date     DATE,
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_recurrences_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_recurrences_account
        FOREIGN KEY (account_id) REFERENCES accounts (id) ON DELETE RESTRICT,
    CONSTRAINT fk_recurrences_category
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT ck_recurrences_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_recurrences_user_id ON recurrences (user_id);
CREATE INDEX idx_recurrences_account_id ON recurrences (account_id);

COMMENT ON TABLE recurrences IS 'Receitas e despesas recorrentes (salário, aluguel, assinaturas)';
