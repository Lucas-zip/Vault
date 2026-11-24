package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de resposta com um quadradinho (slot) da meta.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalSlotPlanResponse {

    private Long id;
    private Integer slotIndex;
    private BigDecimal plannedAmount;
    private Boolean done;
    private BigDecimal actualAmount;
}
