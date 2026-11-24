package com.projeto.vault.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de request para definir ou atualizar o limite mensal de gastos.
 *
 * <p>Se o período não for informado, o serviço utiliza o mês corrente.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpsertMonthlyBudgetRequest {

    @NotNull(message = "O valor limite é obrigatório")
    @Positive(message = "O valor limite deve ser positivo")
    private BigDecimal limitAmount;

    @Pattern(regexp = "^[0-9]{4}-(0[1-9]|1[0-2])$", message = "O período deve estar no formato YYYY-MM")
    private String period;
}
