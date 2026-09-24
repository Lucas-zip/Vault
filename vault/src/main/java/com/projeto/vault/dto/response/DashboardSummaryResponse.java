package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de resposta com o resumo financeiro do mês corrente.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private BigDecimal totalBalance;
    private BigDecimal monthIncome;
    private BigDecimal monthExpense;
    private BigDecimal monthResult;
    private long transactionCount;
    private long pendingCount;
    private long overdueCount;
}
