package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de resposta com o resumo geral das metas do usuário (dashboard).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalSummaryResponse {

    private long activeCount;
    private long completedCount;
    private long archivedCount;
    /** Soma do valor acumulado em todas as metas ativas/concluídas. */
    private BigDecimal totalSaved;
    /** Soma do valor desejado das metas ativas. */
    private BigDecimal totalTargetActive;
}
