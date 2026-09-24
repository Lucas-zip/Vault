package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de resposta com a evolução financeira de um mês específico.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyEvolutionResponse {

    private String period;      // YYYY-MM
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal result;
}
