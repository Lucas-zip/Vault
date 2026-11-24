package com.projeto.vault.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de request para atualizar um item do calendário de depósitos.
 *
 * <p>Permite definir o valor efetivamente depositado e/ou marcar o dia
 * como realizado. Se {@code done=true} e {@code actualAmount} for nulo,
 * considera-se o valor planejado.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDepositPlanRequest {

    @NotNull(message = "A data do depósito é obrigatória")
    private LocalDate depositDate;

    @NotNull(message = "O status é obrigatório")
    private Boolean done;

    @DecimalMin(value = "0.00", message = "O valor depositado não pode ser negativo")
    private BigDecimal actualAmount;
}
