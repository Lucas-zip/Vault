package com.projeto.vault.repository;

import com.projeto.vault.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link Transaction}.
 *
 * <p>Utiliza {@link JpaSpecificationExecutor} para permitir filtros dinâmicos
 * combinados (período, tipo, categoria, conta) via Specifications, e também
 * oferece consultas JPQL para agregações financeiras.</p>
 */
@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    /**
     * Soma de receitas (INCOME) de um usuário em um período.
     */
    @Query(""" 
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = com.projeto.vault.enums.TransactionType.INCOME
              AND t.transactionDate BETWEEN :start AND :end
            """)
    BigDecimal sumIncomeByUserAndDateBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * Soma de despesas (EXPENSE) de um usuário em um período.
     */
    @Query(""" 
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = com.projeto.vault.enums.TransactionType.EXPENSE
              AND t.transactionDate BETWEEN :start AND :end
            """)
    BigDecimal sumExpenseByUserAndDateBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * Soma de despesas de um usuário em uma categoria em um período (para orçamento).
     */
    @Query(""" 
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = com.projeto.vault.enums.TransactionType.EXPENSE
              AND t.category.id = :categoryId
              AND t.transactionDate BETWEEN :start AND :end
            """)
    BigDecimal sumExpenseByUserAndCategoryAndDateBetween(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * Gasto total por categoria (despesas) em um período, para relatórios e dashboard.
     */
    @Query(""" 
            SELECT t.category.id AS categoryId,
                   t.category.name AS categoryName,
                   SUM(t.amount) AS total
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = com.projeto.vault.enums.TransactionType.EXPENSE
              AND (:start IS NULL OR t.transactionDate >= :start)
              AND (:end IS NULL OR t.transactionDate <= :end)
            GROUP BY t.category.id, t.category.name
            ORDER BY total DESC
            """)
    List<Object[]> sumExpenseGroupByCategory(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * Receita total por categoria em um período.
     */
    @Query(""" 
            SELECT t.category.id AS categoryId,
                   t.category.name AS categoryName,
                   SUM(t.amount) AS total
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = com.projeto.vault.enums.TransactionType.INCOME
              AND (:start IS NULL OR t.transactionDate >= :start)
              AND (:end IS NULL OR t.transactionDate <= :end)
            GROUP BY t.category.id, t.category.name
            ORDER BY total DESC
            """)
    List<Object[]> sumIncomeGroupByCategory(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    /**
     * As N maiores despesas de um usuário em um período.
     */
    @Query(""" 
            SELECT t
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = com.projeto.vault.enums.TransactionType.EXPENSE
              AND t.transactionDate >= :start
              AND t.transactionDate <= :end
            ORDER BY t.amount DESC
            """)
    Page<Transaction> findTopExpenses(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            Pageable pageable);

    /**
     * As N maiores receitas de um usuário em um período.
     */
    @Query("""
            SELECT t
            FROM Transaction t
            WHERE t.user.id = :userId
              AND t.type = com.projeto.vault.enums.TransactionType.INCOME
              AND (:start IS NULL OR t.transactionDate >= :start)
              AND (:end IS NULL OR t.transactionDate <= :end)
            ORDER BY t.amount DESC
            """)
    Page<Transaction> findTopIncomes(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            Pageable pageable);
}
