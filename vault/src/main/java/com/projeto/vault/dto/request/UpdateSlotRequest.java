package com.projeto.vault.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de request para preencher ou limpar um quadradinho (slot) da meta.
 *
 * <p>O usuário informa o valor que possui no momento para aquele quadradinho.
 * Se {@code done=true} e {@code actualAmount} for nulo, usa-se o valor
 * planejado do slot.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSlotRequest {

    @NotNull(message = "O índice do quadradinho é obrigatório")
    private Integer slotIndex;

    @NotNull(message = "O status é obrigatório")
    private Boolean done;

    @DecimalMin(value = "0.00", message = "O valor depositado não pode ser negativo")
    private BigDecimal actualAmount;
}
