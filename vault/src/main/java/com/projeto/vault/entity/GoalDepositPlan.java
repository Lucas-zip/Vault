package com.projeto.vault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que representa um item do planejamento diário de depósitos
 * de uma meta (um dia do calendário de depósitos).
 */
@Entity
@Table(name = "goal_deposit_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalDepositPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goal_id", nullable = false)
    private SavingsGoal goal;

    @Column(name = "deposit_date", nullable = false)
    private LocalDate depositDate;

    @Column(name = "planned_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal plannedAmount;

    @Column(nullable = false)
    @Builder.Default
    private Boolean done = false;

    @Column(name = "actual_amount", precision = 19, scale = 2)
    private BigDecimal actualAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
