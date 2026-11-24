package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO de resposta da calculadora de investimentos.
 *
 * <p>Segue o modelo da calculadora "Primeiro Milhão" do Investidor10,
 * diferenciando o dinheiro aportado dos rendimentos projetados.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvestmentSimulationResponse {

    /** Rentabilidade mensal efetiva (decimal, ex: 0.0064 = 0.64% a.m.). */
    private BigDecimal monthlyRate;

    /** Tempo estimado, em meses, para atingir o objetivo. */
    private int monthsToGoal;
    /** Decomposição do tempo: anos. */
    private int yearsToGoal;
    /** Decomposição do tempo: meses restantes (0..11). */
    private int remainingMonths;

    /** Total efetivamente investido (inicial + aportes). */
    private BigDecimal totalInvested;
    /** Total de rendimentos projetados (juros compostos). */
    private BigDecimal totalInterest;
    /** Patrimônio final projetado. */
    private BigDecimal finalAmount;

    /**
     * Aporte mensal necessário para atingir o objetivo no prazo informado.
     * Preenchido apenas quando {@code months} é informado no request.
     */
    private BigDecimal requiredMonthlyContribution;

    /** Evolução do patrimônio (amostrada por mês, limitada a um teto). */
    private List<EvolutionPointResponse> evolution;

    /** Aviso de estimativa (não garantia de retorno). */
    private String disclaimer;
}
