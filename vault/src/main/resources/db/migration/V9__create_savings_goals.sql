-- ============================================
-- Vault - Migration V9: Metas financeiras
-- ============================================

-- ---------- Tabela de metas ----------
CREATE TABLE savings_goals (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    name            VARCHAR(120) NOT NULL,
    description     VARCHAR(500),
    target_amount   DECIMAL(19,2) NOT NULL,
    initial_amount  DECIMAL(19,2) NOT NULL DEFAULT 0,
    current_amount  DECIMAL(19,2) NOT NULL DEFAULT 0,
    start_date      DATE NOT NULL,
    target_date     DATE,
    modality        VARCHAR(30) NOT NULL DEFAULT 'TRADITIONAL',
    deposit_strategy VARCHAR(30),
    color           VARCHAR(20),
    status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_goals_target_positive CHECK (target_amount > 0),
    CONSTRAINT ck_goals_initial_non_negative CHECK (initial_amount >= 0),
    CONSTRAINT ck_goals_current_non_negative CHECK (current_amount >= 0),
    CONSTRAINT ck_goals_dates CHECK (target_date IS NULL OR target_date >= start_date)
);

CREATE INDEX idx_goals_user_id ON savings_goals (user_id);
CREATE INDEX idx_goals_user_status ON savings_goals (user_id, status);

COMMENT ON TABLE savings_goals IS 'Metas financeiras (caixinhas) do usuário';

-- ---------- Movimentações das metas (depósitos e retiradas) ----------
CREATE TABLE goal_movements (
    id            BIGSERIAL PRIMARY KEY,
    goal_id       BIGINT NOT NULL,
    type          VARCHAR(20) NOT NULL,
    amount        DECIMAL(19,2) NOT NULL,
    movement_date DATE NOT NULL,
    description   VARCHAR(255),
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_movements_goal
        FOREIGN KEY (goal_id) REFERENCES savings_goals (id) ON DELETE CASCADE,
    CONSTRAINT ck_movements_amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_movements_goal_id ON goal_movements (goal_id);
CREATE INDEX idx_movements_goal_date ON goal_movements (goal_id, movement_date);

COMMENT ON TABLE goal_movements IS 'Depósitos e retiradas das metas financeiras';

-- ---------- Plano de depósitos (calendário) ----------
CREATE TABLE goal_deposit_plans (
    id                  BIGSERIAL PRIMARY KEY,
    goal_id             BIGINT NOT NULL,
    deposit_date        DATE NOT NULL,
    planned_amount      DECIMAL(19,2) NOT NULL,
    done                BOOLEAN NOT NULL DEFAULT FALSE,
    actual_amount       DECIMAL(19,2),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_plan_goal
        FOREIGN KEY (goal_id) REFERENCES savings_goals (id) ON DELETE CASCADE,
    CONSTRAINT ck_plan_planned_positive CHECK (planned_amount >= 0)
);

CREATE INDEX idx_plan_goal_id ON goal_deposit_plans (goal_id);
CREATE UNIQUE INDEX uk_plan_goal_date ON goal_deposit_plans (goal_id, deposit_date);

COMMENT ON TABLE goal_deposit_plans IS 'Planejamento diário de depósitos das metas';
