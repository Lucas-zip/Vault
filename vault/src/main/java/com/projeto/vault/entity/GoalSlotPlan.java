package com.projeto.vault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade que representa um "quadradinho" (slot) de uma meta dividida
 * em N partes.
 *
 * <p>Diferente de {@link GoalDepositPlan} (que usa datas), aqui cada slot é
 * identificado apenas pela sua posição ({@code slotIndex}). O usuário preenche
 * cada slot com o valor que tiver no momento, até completar a meta.</p>
 */
@Entity
@Table(name = "goal_slot_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalSlotPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goal_id", nullable = false)
    private SavingsGoal goal;

    /** Posição do quadradinho (0..N-1). */
    @Column(name = "slot_index", nullable = false)
    private Integer slotIndex;

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
