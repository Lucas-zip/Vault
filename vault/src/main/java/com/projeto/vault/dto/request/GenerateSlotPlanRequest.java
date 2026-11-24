package com.projeto.vault.dto.request;

import com.projeto.vault.enums.DepositStrategy;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de request para (re)gerar os quadradinhos (slots) de uma meta.
 *
 * <p>O usuário informa em quantos quadradinhos deseja dividir a meta.
 * A estratégia define como o valor restante é distribuído (fixo, crescente
 * ou aleatório). Em todos os casos, a soma dos slots fecha a meta.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GenerateSlotPlanRequest {

    @NotNull(message = "A quantidade de quadradinhos é obrigatória")
    @Min(value = 1, message = "Informe ao menos 1 quadradinho")
    @Max(value = 500, message = "O número máximo de quadradinhos é 500")
    private Integer slotCount;

    /** Estratégia de distribuição. Padrão: FIXED. */
    private DepositStrategy strategy;
}
