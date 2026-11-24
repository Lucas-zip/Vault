package com.projeto.vault.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de request para a calculadora de investimentos.
 *
 * <p>Reproduz a lógica da calculadora "Primeiro Milhão" do Investidor10:
 * trabalha com patrimônio inicial (PV), patrimônio desejado (FV), aporte
 * mensal (PMT), rentabilidade e prazo, usando juros compostos com aportes.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentSimulationRequest {

    @NotNull(message = "O patrimônio inicial é obrigatório")
    @DecimalMin(value = "0.00", message = "O patrimônio inicial não pode ser negativo")
    private BigDecimal initialAmount;

    @NotNull(message = "O patrimônio desejado é obrigatório")
    @DecimalMin(value = "0.01", message = "O patrimônio desejado deve ser maior que zero")
    private BigDecimal targetAmount;

    @NotNull(message = "O aporte mensal é obrigatório")
    @DecimalMin(value = "0.00", message = "O aporte mensal não pode ser negativo")
    private BigDecimal monthlyContribution;

    /**
     * Rentabilidade informada. Interpretada conforme {@code ratePeriod}:
     * ANNUAL (ao ano) ou MONTHLY (ao mês).
     */
    @NotNull(message = "A rentabilidade é obrigatória")
    private BigDecimal rate;

    /** ANNUAL ou MONTHLY. Se nulo, assume ANNUAL. */
    private String ratePeriod;

    /**
     * Prazo em meses. Quando informado, a calculadora calcula o aporte
     * necessário para atingir o objetivo no prazo.
     */
    @Min(value = 0, message = "O prazo não pode ser negativo")
    private Integer months;
}
