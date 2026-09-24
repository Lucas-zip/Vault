package com.projeto.vault.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de resposta com o total financeiro agrupado por categoria.
 * Usado no dashboard e relatórios.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryAmountResponse {

    private Long categoryId;
    private String categoryName;
    private BigDecimal total;
}
