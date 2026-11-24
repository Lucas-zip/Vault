package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * DTO de resposta detalhada de uma meta, incluindo histórico de
 * movimentações e (quando houver) o calendário de depósitos.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalDetailResponse {

    private GoalResponse goal;
    private List<GoalMovementResponse> movements;
    private List<GoalDepositPlanResponse> depositPlan;
    private List<GoalSlotPlanResponse> slotPlan;
}
