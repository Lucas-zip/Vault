-- ============================================
-- Vault - Migration V3: Criação da tabela categories
-- ============================================

CREATE TABLE categories (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    name        VARCHAR(120) NOT NULL,
    type        VARCHAR(20) NOT NULL,
    description VARCHAR(255),

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_categories_user_id ON categories (user_id);
CREATE UNIQUE INDEX uk_categories_user_name_type ON categories (user_id, name, type);

COMMENT ON TABLE categories IS 'Categorias de receitas e despesas (ex: Alimentação, Salário)';
