package com.projeto.vault.specification;

import com.projeto.vault.entity.Transaction;
import com.projeto.vault.enums.TransactionType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Specifications para filtrar {@link Transaction} de forma dinâmica e
 * segura, permitindo combinar vários critérios sem escrever consultas
 * JPQL manualmente a cada combinação.
 *
 * <p>Sempre filtra por {@code userId} para garantir o isolamento dos dados.</p>
 */
public final class TransactionSpecification {

    private TransactionSpecification() {
    }

    /**
     * Constrói uma Specification que combina os filtros informados.
     * Filtros nulos são ignorados.
     */
    public static Specification<Transaction> withFilters(
            Long userId,
            LocalDate startDate,
            LocalDate endDate,
            TransactionType type,
            Long categoryId,
            Long accountId) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Isolamento por usuário (sempre aplicado)
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), startDate));
            }
            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), endDate));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (accountId != null) {
                predicates.add(cb.equal(root.get("account").get("id"), accountId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
