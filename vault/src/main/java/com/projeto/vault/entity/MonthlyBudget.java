package com.projeto.vault.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Limite mensal total de gastos de um usuário.
 *
 * <p>Representa o teto de despesas de um mês (ex.: "No máximo R$ 5.000 em agosto").
 * Existe no máximo um registro por usuário e período ({@code YYYY-MM}).</p>
 *
 * <p>Diferencia-se de {@link Budget}, que é um orçamento por categoria.</p>
 */
@Entity
@Table(name = "monthly_budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Período do orçamento no formato 'YYYY-MM' (ex: 2025-08). */
    @Column(nullable = false, length = 7)
    private String period;

    @Column(name = "limit_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
