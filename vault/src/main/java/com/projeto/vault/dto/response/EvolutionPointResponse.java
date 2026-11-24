package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Ponto de evolução do patrimônio (por mês ou por ano) para gráficos.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvolutionPointResponse {

    /** Mês (1..n) a partir do início da projeção. */
    private int month;
    /** Ano correspondente do período (1 = primeiro ano). */
    private int year;
    /** Total efetivamente aportado até o momento (inicial + aportes). */
    private BigDecimal invested;
    /** Total de rendimentos acumulados até o momento. */
    private BigDecimal interest;
    /** Patrimônio projetado (investido + rendimento). */
    private BigDecimal balance;
}
