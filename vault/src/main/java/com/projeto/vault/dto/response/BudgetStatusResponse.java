package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de resposta com o cálculo de utilização de um orçamento.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetStatusResponse {

    private Long budgetId;
    private String categoryName;
    private String period;
    private BigDecimal limitAmount;
    private BigDecimal usedAmount;
    private BigDecimal remainingAmount;
    private BigDecimal percentageUsed;
    private boolean exceeded;
}
