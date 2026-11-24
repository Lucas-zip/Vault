package com.projeto.vault.dto.request;

import com.projeto.vault.enums.DepositStrategy;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de request para (re)gerar o calendário de depósitos de uma meta.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GenerateDepositPlanRequest {

    @NotNull(message = "A estratégia é obrigatória")
    private DepositStrategy strategy;

    /**
     * Quando verdadeiro, somente dias a partir de hoje são planejados
     * (mantendo os depósitos já realizados no passado).
     */
    private Boolean redistributeRemaining;
}
