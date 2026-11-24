package com.projeto.vault.service;

import com.projeto.vault.dto.request.UpsertMonthlyBudgetRequest;
import com.projeto.vault.dto.response.MonthlyBudgetStatusResponse;
import com.projeto.vault.entity.MonthlyBudget;
import com.projeto.vault.entity.User;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.repository.MonthlyBudgetRepository;
import com.projeto.vault.repository.TransactionRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;

/**
 * Serviço do limite mensal total de gastos.
 *
 * <p>Calcula o total gasto considerando apenas despesas (EXPENSE) do mês
 * correspondente e compara com o limite definido pelo usuário.</p>
 */
@Service
public class MonthlyBudgetService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public MonthlyBudgetService(MonthlyBudgetRepository monthlyBudgetRepository,
                                TransactionRepository transactionRepository,
                                UserRepository userRepository) {
        this.monthlyBudgetRepository = monthlyBudgetRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Retorna o status do mês corrente.
     */
    @Transactional(readOnly = true)
    public MonthlyBudgetStatusResponse getCurrentStatus(Long userId) {
        return getStatus(userId, YearMonth.now().toString());
    }

    /**
     * Retorna o status de um período específico ({@code YYYY-MM}).
     * Se não houver orçamento definido, retorna {@code defined = false}
     * com o total gasto calculado (para exibição opcional).
     */
    @Transactional(readOnly = true)
    public MonthlyBudgetStatusResponse getStatus(Long userId, String period) {
        YearMonth yearMonth = parsePeriod(period);
        BigDecimal spent = sumMonthExpenses(userId, yearMonth);

        return monthlyBudgetRepository.findByUserIdAndPeriod(userId, yearMonth.toString())
                .map(budget -> buildStatus(yearMonth, budget.getLimitAmount(), spent))
                .orElseGet(() -> MonthlyBudgetStatusResponse.builder()
                        .period(yearMonth.toString())
                        .defined(false)
                        .spentAmount(spent)
                        .build());
    }

    /**
     * Define ou atualiza o limite mensal (upsert por usuário + período).
     */
    @Transactional
    public MonthlyBudgetStatusResponse upsert(Long userId, UpsertMonthlyBudgetRequest request) {
        YearMonth yearMonth = request.getPeriod() != null
                ? parsePeriod(request.getPeriod())
                : YearMonth.now();
        String period = yearMonth.toString();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        MonthlyBudget budget = monthlyBudgetRepository
                .findByUserIdAndPeriod(userId, period)
                .orElseGet(() -> MonthlyBudget.builder()
                        .user(user)
                        .period(period)
                        .build());

        budget.setLimitAmount(request.getLimitAmount());
        MonthlyBudget saved = monthlyBudgetRepository.save(budget);

        BigDecimal spent = sumMonthExpenses(userId, yearMonth);
        return buildStatus(yearMonth, saved.getLimitAmount(), spent);
    }

    /**
     * Remove o orçamento de um período. Após remoção, o sistema volta a
     * funcionar normalmente, sem avisos de limite excedido.
     */
    @Transactional
    public void delete(Long userId, String period) {
        YearMonth yearMonth = parsePeriod(period);
        monthlyBudgetRepository.findByUserIdAndPeriod(userId, yearMonth.toString())
                .ifPresent(monthlyBudgetRepository::delete);
    }

    private MonthlyBudgetStatusResponse buildStatus(YearMonth yearMonth,
                                                    BigDecimal limit,
                                                    BigDecimal spent) {
        BigDecimal remaining = limit.subtract(spent);

        BigDecimal percentage = BigDecimal.ZERO;
        if (limit.compareTo(BigDecimal.ZERO) > 0) {
            percentage = spent.multiply(HUNDRED)
                    .divide(limit, 2, RoundingMode.HALF_UP);
        }

        boolean exceeded = spent.compareTo(limit) > 0;

        return MonthlyBudgetStatusResponse.builder()
                .period(yearMonth.toString())
                .defined(true)
                .limitAmount(limit)
                .spentAmount(spent)
                .remainingAmount(remaining)
                .percentageUsed(percentage)
                .exceeded(exceeded)
                .build();
    }

    private BigDecimal sumMonthExpenses(Long userId, YearMonth yearMonth) {
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        // Considera apenas despesas (INCOME é ignorado pela query)
        return transactionRepository.sumExpenseByUserAndDateBetween(userId, start, end);
    }

    private YearMonth parsePeriod(String period) {
        try {
            return YearMonth.parse(period);
        } catch (Exception e) {
            throw new BusinessException("Período inválido. Use o formato YYYY-MM");
        }
    }
}
