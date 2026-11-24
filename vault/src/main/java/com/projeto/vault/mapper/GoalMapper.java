package com.projeto.vault.mapper;

import com.projeto.vault.dto.response.GoalDepositPlanResponse;
import com.projeto.vault.dto.response.GoalMovementResponse;
import com.projeto.vault.dto.response.GoalResponse;
import com.projeto.vault.dto.response.GoalSlotPlanResponse;
import com.projeto.vault.entity.GoalDepositPlan;
import com.projeto.vault.entity.GoalMovement;
import com.projeto.vault.entity.GoalSlotPlan;
import com.projeto.vault.entity.SavingsGoal;
import com.projeto.vault.enums.GoalStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Mapper de conversão entre {@link SavingsGoal} e seus DTOs.
 */
@Component
public class GoalMapper {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    public GoalResponse toResponse(SavingsGoal goal) {
        if (goal == null) {
            return null;
        }

        BigDecimal target = goal.getTargetAmount() != null ? goal.getTargetAmount() : BigDecimal.ZERO;
        BigDecimal current = goal.getCurrentAmount() != null ? goal.getCurrentAmount() : BigDecimal.ZERO;

        BigDecimal remaining = target.subtract(current);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        BigDecimal percentage = BigDecimal.ZERO;
        if (target.compareTo(BigDecimal.ZERO) > 0) {
            percentage = current.multiply(HUNDRED).divide(target, 2, RoundingMode.HALF_UP);
        }

        boolean completed = current.compareTo(target) >= 0;

        return GoalResponse.builder()
                .id(goal.getId())
                .name(goal.getName())
                .description(goal.getDescription())
                .targetAmount(target)
                .initialAmount(goal.getInitialAmount())
                .currentAmount(current)
                .remainingAmount(remaining)
                .percentage(percentage)
                .startDate(goal.getStartDate())
                .targetDate(goal.getTargetDate())
                .modality(goal.getModality())
                .depositStrategy(goal.getDepositStrategy())
                .color(goal.getColor())
                .status(goal.getStatus())
                .completed(completed || goal.getStatus() == GoalStatus.COMPLETED)
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }

    public GoalMovementResponse toResponse(GoalMovement movement) {
        if (movement == null) {
            return null;
        }
        return GoalMovementResponse.builder()
                .id(movement.getId())
                .type(movement.getType())
                .amount(movement.getAmount())
                .movementDate(movement.getMovementDate())
                .description(movement.getDescription())
                .createdAt(movement.getCreatedAt())
                .build();
    }

    public GoalDepositPlanResponse toResponse(GoalDepositPlan plan) {
        if (plan == null) {
            return null;
        }
        return GoalDepositPlanResponse.builder()
                .id(plan.getId())
                .depositDate(plan.getDepositDate())
                .plannedAmount(plan.getPlannedAmount())
                .done(plan.getDone())
                .actualAmount(plan.getActualAmount())
                .build();
    }

    public GoalSlotPlanResponse toResponse(GoalSlotPlan slot) {
        if (slot == null) {
            return null;
        }
        return GoalSlotPlanResponse.builder()
                .id(slot.getId())
                .slotIndex(slot.getSlotIndex())
                .plannedAmount(slot.getPlannedAmount())
                .done(slot.getDone())
                .actualAmount(slot.getActualAmount())
                .build();
    }
}
