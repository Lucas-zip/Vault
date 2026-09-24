 package com.projeto.vault.service;

import com.projeto.vault.dto.response.CategoryAmountResponse;
import com.projeto.vault.dto.response.MonthlyEvolutionResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.mapper.CategoryAmountMapper;
import com.projeto.vault.mapper.TransactionMapper;
import com.projeto.vault.repository.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Serviço responsável pelos relatórios financeiros.
 *
 * <p>Oferece consultas agregadas para receitas, despesas, saldo por período,
 * gastos por categoria e evolução financeira mensal.</p>
 */
@Service
public class ReportService {

    private static final int TOP_LIMIT = 10;

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;
    private final CategoryAmountMapper categoryAmountMapper;

    public ReportService(TransactionRepository transactionRepository,
                         TransactionMapper transactionMapper,
                         CategoryAmountMapper categoryAmountMapper) {
        this.transactionRepository = transactionRepository;
        this.transactionMapper = transactionMapper;
        this.categoryAmountMapper = categoryAmountMapper;
    }

    /**
     * Resumo de receitas e despesas de um período.
     */
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getSummary(Long userId, LocalDate start, LocalDate end) {
        BigDecimal income = transactionRepository.sumIncomeByUserAndDateBetween(userId, start, end);
        BigDecimal expense = transactionRepository.sumExpenseByUserAndDateBetween(userId, start, end);

        Map<String, BigDecimal> summary = new LinkedHashMap<>();
        summary.put("income", income);
        summary.put("expense", expense);
        summary.put("result", income.subtract(expense));
        return summary;
    }

    /**
     * Gastos por categoria em um período, do maior para o menor.
     */
    @Transactional(readOnly = true)
    public List<CategoryAmountResponse> getExpensesByCategory(Long userId, LocalDate start, LocalDate end) {
        return categoryAmountMapper.mapExpenses(
                transactionRepository.sumExpenseGroupByCategory(userId, start, end));
    }

    /**
     * Receitas por categoria em um período.
     */
    @Transactional(readOnly = true)
    public List<CategoryAmountResponse> getIncomesByCategory(Long userId, LocalDate start, LocalDate end) {
        return categoryAmountMapper.mapIncomes(
                transactionRepository.sumIncomeGroupByCategory(userId, start, end));
    }

    /**
     * Evolução financeira mensal em um intervalo de meses.
     */
    @Transactional(readOnly = true)
    public List<MonthlyEvolutionResponse> getMonthlyEvolution(Long userId, LocalDate start, LocalDate end) {
        YearMonth startMonth = YearMonth.from(start);
        YearMonth endMonth = YearMonth.from(end);

        List<MonthlyEvolutionResponse> result = new ArrayList<>();
        YearMonth current = startMonth;
        while (!current.isAfter(endMonth)) {
            LocalDate monthStart = current.atDay(1);
            LocalDate monthEnd = current.atEndOfMonth();

            BigDecimal income = transactionRepository.sumIncomeByUserAndDateBetween(userId, monthStart, monthEnd);
            BigDecimal expense = transactionRepository.sumExpenseByUserAndDateBetween(userId, monthStart, monthEnd);

            result.add(MonthlyEvolutionResponse.builder()
                    .period(current.toString())
                    .income(income)
                    .expense(expense)
                    .result(income.subtract(expense))
                    .build());

            current = current.plusMonths(1);
        }
        return result;
    }

    /**
     * Maiores despesas do período (top N).
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTopExpenses(Long userId, LocalDate start, LocalDate end) {
        return transactionRepository
                .findTopExpenses(userId, start, end, PageRequest.of(0, TOP_LIMIT))
                .map(transactionMapper::toResponse)
                .toList();
    }

    /**
     * Maiores receitas do período (top N).
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTopIncomes(Long userId, LocalDate start, LocalDate end) {
        return transactionRepository
                .findTopIncomes(userId, start, end, PageRequest.of(0, TOP_LIMIT))
                .map(transactionMapper::toResponse)
                .toList();
    }
}
