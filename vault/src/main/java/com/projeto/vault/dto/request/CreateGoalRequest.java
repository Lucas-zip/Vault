package com.projeto.vault.dto.request;

import com.projeto.vault.enums.DepositStrategy;
import com.projeto.vault.enums.GoalModality;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de request para criação de uma meta financeira.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalRequest {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String name;

    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    private String description;

    @NotNull(message = "O valor desejado é obrigatório")
    @DecimalMin(value = "0.01", message = "O valor desejado deve ser maior que zero")
    private BigDecimal targetAmount;

    @DecimalMin(value = "0.00", message = "O valor inicial não pode ser negativo")
    private BigDecimal initialAmount;

    @NotNull(message = "A data de início é obrigatória")
    private LocalDate startDate;

    /** Data limite opcional. */
    private LocalDate targetDate;

    @NotNull(message = "A modalidade é obrigatória")
    private GoalModality modality;

    private DepositStrategy depositStrategy;

    @Size(max = 20)
    private String color;
}
