package com.projeto.vault.repository;

import com.projeto.vault.entity.SavingsGoal;
import com.projeto.vault.enums.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link SavingsGoal}.
 */
@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    List<SavingsGoal> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<SavingsGoal> findAllByUserIdAndStatus(Long userId, GoalStatus status);

    Optional<SavingsGoal> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
