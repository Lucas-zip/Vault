package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de resposta com um item do calendário de depósitos de uma meta.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalDepositPlanResponse {

    private Long id;
    private LocalDate depositDate;
    private BigDecimal plannedAmount;
    private Boolean done;
    private BigDecimal actualAmount;
}
