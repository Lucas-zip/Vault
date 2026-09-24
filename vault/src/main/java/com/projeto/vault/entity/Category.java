package com.projeto.vault.entity;

import com.projeto.vault.enums.CategoryType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entidade que representa uma categoria de receita ou despesa.
 *
 * <p>Exemplos: Alimentação, Transporte (despesa); Salário, Freelance (receita).</p>
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CategoryType type;

    @Column(length = 255)
    private String description;
}
