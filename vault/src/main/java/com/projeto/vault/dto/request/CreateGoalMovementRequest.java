package com.projeto.vault.dto.request;

import com.projeto.vault.enums.GoalMovementType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de request para registrar um depósito ou retirada em uma meta.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalMovementRequest {

    @NotNull(message = "O tipo da movimentação é obrigatório")
    private GoalMovementType type;

    @NotNull(message = "O valor é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
    private BigDecimal amount;

    @NotNull(message = "A data é obrigatória")
    private LocalDate movementDate;

    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
    private String description;
}
