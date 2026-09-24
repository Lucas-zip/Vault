package com.projeto.vault.dto.request;

import com.projeto.vault.enums.TransactionType;
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
 * DTO de request para atualização de uma conta a pagar ou a receber.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFutureTransactionRequest {

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
    private String description;

    @NotNull(message = "O valor é obrigatório")
    @Positive(message = "O valor deve ser positivo")
    private BigDecimal amount;

    @NotNull(message = "A data de vencimento é obrigatória")
    private LocalDate dueDate;

    @NotNull(message = "O tipo é obrigatório (INCOME ou EXPENSE)")
    private TransactionType type;

    private Long categoryId;

    private Long accountId;
}
