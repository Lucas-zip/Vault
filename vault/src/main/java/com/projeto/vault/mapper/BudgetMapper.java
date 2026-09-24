package com.projeto.vault.mapper;

import com.projeto.vault.dto.response.BudgetResponse;
import com.projeto.vault.entity.Budget;
import org.springframework.stereotype.Component;

/**
 * Mapper de conversão entre {@link Budget} e seus DTOs.
 */
@Component
public class BudgetMapper {

    public BudgetResponse toResponse(Budget budget) {
        if (budget == null) {
            return null;
        }
        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory() != null ? budget.getCategory().getId() : null)
                .categoryName(budget.getCategory() != null ? budget.getCategory().getName() : null)
                .limitAmount(budget.getLimitAmount())
                .period(budget.getPeriod())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}
