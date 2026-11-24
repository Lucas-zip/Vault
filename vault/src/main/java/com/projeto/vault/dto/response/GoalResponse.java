package com.projeto.vault.dto.response;

import com.projeto.vault.enums.DepositStrategy;
import com.projeto.vault.enums.GoalModality;
import com.projeto.vault.enums.GoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de resposta com os dados de uma meta financeira e métricas de progresso.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal initialAmount;
    private BigDecimal currentAmount;
    /** Quanto falta para alcançar o valor desejado (nunca negativo). */
    private BigDecimal remainingAmount;
    /** Percentual concluído (0 a 100+, limitado visualmente no frontend). */
    private BigDecimal percentage;
    private LocalDate startDate;
    private LocalDate targetDate;
    private GoalModality modality;
    private DepositStrategy depositStrategy;
    private String color;
    private GoalStatus status;
    private boolean completed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
