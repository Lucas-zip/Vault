package com.projeto.vault.mapper;

import com.projeto.vault.dto.request.CreateTransactionRequest;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.entity.Transaction;
import org.springframework.stereotype.Component;

/**
 * Mapper de conversão entre {@link Transaction} e seus DTOs.
 *
 * <p>A construção da entidade a partir do request é feita no service,
 * porque depende da resolução de Account/Category/User (lazy loading).
 * Este mapper foca principalmente na conversão para Response.</p>
 */
@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction transaction) {
        if (transaction == null) {
            return null;
        }
        return TransactionResponse.builder()
                .id(transaction.getId())
                .description(transaction.getDescription())
                .amount(transaction.getAmount())
                .type(transaction.getType() != null ? transaction.getType().name() : null)
                .transactionDate(transaction.getTransactionDate())
                .observation(transaction.getObservation())
                .status(transaction.getStatus())
                .accountId(transaction.getAccount() != null ? transaction.getAccount().getId() : null)
                .accountName(transaction.getAccount() != null ? transaction.getAccount().getName() : null)
                .categoryId(transaction.getCategory() != null ? transaction.getCategory().getId() : null)
                .categoryName(transaction.getCategory() != null ? transaction.getCategory().getName() : null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
