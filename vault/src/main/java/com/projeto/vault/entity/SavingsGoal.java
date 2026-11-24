package com.projeto.vault.entity;

import com.projeto.vault.enums.DepositStrategy;
import com.projeto.vault.enums.GoalModality;
import com.projeto.vault.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidade que representa uma meta financeira (caixinha) do usuário.
 *
 * <p>Exemplo: "Quero juntar R$ 5.000 para comprar um computador.".
 * O campo {@code currentAmount} é mantido em sincronia com as movimentações
 * (depósitos e retiradas) pelo {@code SavingsGoalService}.</p>
 */
@Entity
@Table(name = "savings_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "target_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "initial_amount", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal initialAmount = BigDecimal.ZERO;

    @Column(name = "current_amount", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private GoalModality modality = GoalModality.TRADITIONAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_strategy", length = 30)
    private DepositStrategy depositStrategy;

    @Column(length = 20)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GoalMovement> movements = new ArrayList<>();

    @OneToMany(mappedBy = "goal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GoalDepositPlan> depositPlans = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.initialAmount == null) {
            this.initialAmount = BigDecimal.ZERO;
        }
        this.currentAmount = this.initialAmount;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
