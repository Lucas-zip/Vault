package com.projeto.vault.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de request para criação de um orçamento mensal por categoria.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBudgetRequest {

    @NotNull(message = "O id da categoria é obrigatório")
    private Long categoryId;

    @NotNull(message = "O valor limite é obrigatório")
    @Positive(message = "O valor limite deve ser positivo")
    private BigDecimal limitAmount;

    @NotBlank(message = "O período é obrigatório")
    @Pattern(regexp = "^[0-9]{4}-(0[1-9]|1[0-2])$", message = "O período deve estar no formato YYYY-MM")
    private String period;
}
