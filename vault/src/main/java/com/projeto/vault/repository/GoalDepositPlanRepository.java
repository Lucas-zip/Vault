package com.projeto.vault.repository;

import com.projeto.vault.entity.GoalDepositPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link GoalDepositPlan}.
 */
@Repository
public interface GoalDepositPlanRepository extends JpaRepository<GoalDepositPlan, Long> {

    List<GoalDepositPlan> findAllByGoalIdOrderByDepositDateAsc(Long goalId);

    Optional<GoalDepositPlan> findByGoalIdAndDepositDate(Long goalId, LocalDate depositDate);

    void deleteAllByGoalId(Long goalId);
}
