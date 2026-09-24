package com.projeto.vault.repository;

import com.projeto.vault.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link Budget}.
 */
@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    List<Budget> findAllByUserId(Long userId);

    List<Budget> findAllByUserIdAndPeriod(Long userId, String period);

    Optional<Budget> findByUserIdAndCategoryIdAndPeriod(Long userId, Long categoryId, String period);

    boolean existsByUserIdAndCategoryIdAndPeriod(Long userId, Long categoryId, String period);
}
