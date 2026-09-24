package com.projeto.vault.mapper;

import com.projeto.vault.dto.response.FutureTransactionResponse;
import com.projeto.vault.entity.FutureTransaction;
import org.springframework.stereotype.Component;

/**
 * Mapper de conversão entre {@link FutureTransaction} e seus DTOs.
 */
@Component
public class FutureTransactionMapper {

    public FutureTransactionResponse toResponse(FutureTransaction future) {
        if (future == null) {
            return null;
        }
        return FutureTransactionResponse.builder()
                .id(future.getId())
                .description(future.getDescription())
                .amount(future.getAmount())
                .dueDate(future.getDueDate())
                .type(future.getType() != null ? future.getType().name() : null)
                .status(future.getStatus() != null ? future.getStatus().name() : null)
                .categoryId(future.getCategory() != null ? future.getCategory().getId() : null)
                .categoryName(future.getCategory() != null ? future.getCategory().getName() : null)
                .accountId(future.getAccount() != null ? future.getAccount().getId() : null)
                .accountName(future.getAccount() != null ? future.getAccount().getName() : null)
                .createdAt(future.getCreatedAt())
                .build();
    }
}
