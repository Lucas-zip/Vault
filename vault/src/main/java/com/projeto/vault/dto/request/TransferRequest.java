package com.projeto.vault.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO de request para transferência entre duas contas do mesmo usuário.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {

    @NotNull(message = "A conta de origem é obrigatória")
    private Long fromAccountId;

    @NotNull(message = "A conta de destino é obrigatória")
    private Long toAccountId;

    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor deve ser positivo")
    private BigDecimal amount;

    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
    private String description;

    private LocalDate transactionDate;
}
