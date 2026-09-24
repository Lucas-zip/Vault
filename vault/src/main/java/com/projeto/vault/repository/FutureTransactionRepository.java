package com.projeto.vault.repository;

import com.projeto.vault.entity.FutureTransaction;
import com.projeto.vault.enums.FutureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link FutureTransaction}.
 */
@Repository
public interface FutureTransactionRepository extends JpaRepository<FutureTransaction, Long> {

    Optional<FutureTransaction> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    List<FutureTransaction> findAllByUserId(Long userId);

    List<FutureTransaction> findAllByUserIdAndStatus(Long userId, FutureStatus status);

    /** Contas vencidas (status PENDING e data de vencimento antes de hoje). */
    List<FutureTransaction> findAllByUserIdAndStatusAndDueDateBefore(
            Long userId, FutureStatus status, LocalDate date);

    /** Próximos vencimentos até uma data limite. */
    List<FutureTransaction> findAllByUserIdAndStatusAndDueDateBetween(
            Long userId, FutureStatus status, LocalDate start, LocalDate end);

    long countByUserIdAndStatus(Long userId, FutureStatus status);
}
