package com.projeto.vault.repository;

import com.projeto.vault.entity.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link MonthlyBudget}.
 */
@Repository
public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {

    Optional<MonthlyBudget> findByUserIdAndPeriod(Long userId, String period);

    boolean existsByUserIdAndPeriod(Long userId, String period);
}
