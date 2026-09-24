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
 * DTO de resposta com os dados de uma recorrência.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurrenceResponse {

    private Long id;
    private String description;
    private BigDecimal amount;
    private String type;
    private String frequency;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
    private Long accountId;
    private String accountName;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
}
