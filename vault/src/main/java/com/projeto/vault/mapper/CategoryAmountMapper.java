package com.projeto.vault.mapper;


import com.projeto.vault.dto.response.CategoryAmountResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Mapper que converte o resultado de agregações JPQL (Object[])
 * em DTOs tipados de {@link CategoryAmountResponse}.
 */
@Component
public class CategoryAmountMapper {

    /**
     * Converte o resultado de sumExpenseGroupByCategory/sumIncomeGroupByCategory.
     * Cada linha do Object[] tem [0]=categoryId, [1]=categoryName, [2]=total.
     */
    public List<CategoryAmountResponse> mapExpenses(List<Object[]> rows) {
        return map(rows);
    }

    public List<CategoryAmountResponse> mapIncomes(List<Object[]> rows) {
        return map(rows);
    }

    private List<CategoryAmountResponse> map(List<Object[]> rows) {
        if (rows == null) {
            return List.of();
        }
        return rows.stream()
                .map(row -> CategoryAmountResponse.builder()
                        .categoryId(((Number) row[0]).longValue())
                        .categoryName((String) row[1])
                        .total((BigDecimal) row[2])
                        .build())
                .toList();
    }
}
