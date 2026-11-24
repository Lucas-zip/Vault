package com.projeto.vault.dto.response;

import com.projeto.vault.enums.GoalMovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de resposta com uma movimentação (depósito/retirada) de uma meta.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalMovementResponse {

    private Long id;
    private GoalMovementType type;
    private BigDecimal amount;
    private LocalDate movementDate;
    private String description;
    private LocalDateTime createdAt;
}
