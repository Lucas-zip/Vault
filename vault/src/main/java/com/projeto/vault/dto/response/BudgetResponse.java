package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de resposta com os dados de um orçamento.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal limitAmount;
    private String period;
    private LocalDateTime createdAt;
}
