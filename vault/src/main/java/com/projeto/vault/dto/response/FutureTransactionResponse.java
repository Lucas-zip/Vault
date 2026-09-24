package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de resposta com os dados de uma conta a pagar ou a receber.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FutureTransactionResponse {

    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate dueDate;
    private String type;
    private String status;
    private Long categoryId;
    private String categoryName;
    private Long accountId;
    private String accountName;
    private LocalDateTime createdAt;
}
