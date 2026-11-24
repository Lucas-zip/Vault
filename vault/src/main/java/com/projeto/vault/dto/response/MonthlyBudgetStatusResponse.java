package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de resposta com o resumo do limite mensal de gastos.
 *
 * <p>Quando não há orçamento definido para o período, {@code defined} é {@code false}
 * e os demais campos de valor são {@code null}.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyBudgetStatusResponse {

    private String period;
    private boolean defined;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private BigDecimal percentageUsed;
    private boolean exceeded;
}
