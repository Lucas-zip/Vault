package com.projeto.vault.repository;

import com.projeto.vault.entity.GoalMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório de acesso a dados para {@link GoalMovement}.
 */
@Repository
public interface GoalMovementRepository extends JpaRepository<GoalMovement, Long> {

    List<GoalMovement> findAllByGoalIdOrderByMovementDateDescIdDesc(Long goalId);
}
