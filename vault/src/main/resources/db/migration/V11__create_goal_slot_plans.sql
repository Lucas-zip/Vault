-- ============================================
-- Vault - Migration V11: Slots de metas (quadradinhos)
-- ============================================
-- Divide a meta em N "quadradinhos" (slots numerados) em vez de dias.
-- O usuário preenche cada slot com o valor que tiver no momento.

CREATE TABLE goal_slot_plans (
    id              BIGSERIAL PRIMARY KEY,
    goal_id         BIGINT NOT NULL,
    slot_index      INTEGER NOT NULL,          -- posição do quadradinho (0..N-1)
    planned_amount  DECIMAL(19,2) NOT NULL,
    done            BOOLEAN NOT NULL DEFAULT FALSE,
    actual_amount   DECIMAL(19,2),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_slot_plan_goal
        FOREIGN KEY (goal_id) REFERENCES savings_goals (id) ON DELETE CASCADE,
    CONSTRAINT ck_slot_plan_planned_positive CHECK (planned_amount >= 0),
    CONSTRAINT ck_slot_plan_index_non_negative CHECK (slot_index >= 0)
);

CREATE INDEX idx_slot_plan_goal_id ON goal_slot_plans (goal_id);
CREATE UNIQUE INDEX uk_slot_plan_goal_index ON goal_slot_plans (goal_id, slot_index);

COMMENT ON TABLE goal_slot_plans IS 'Metas divididas em quadradinhos (slots) preenchíveis';
