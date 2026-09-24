package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de resposta com os dados de uma conta financeira.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {

    private Long id;
    private String name;
    private String type;
    private BigDecimal initialBalance;
    private BigDecimal currentBalance;
    private String institution;
    private String description;
    private String status;
    private LocalDateTime createdAt;
}
