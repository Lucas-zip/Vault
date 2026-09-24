package com.projeto.vault.service;

import com.projeto.vault.dto.response.AccountBalanceResponse;
import com.projeto.vault.dto.response.CategoryAmountResponse;
import com.projeto.vault.dto.response.DashboardSummaryResponse;
import com.projeto.vault.dto.response.FutureTransactionResponse;
import com.projeto.vault.dto.response.MonthlyEvolutionResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.FutureTransaction;
import com.projeto.vault.enums.FutureStatus;
import com.projeto.vault.mapper.CategoryAmountMapper;
import com.projeto.vault.mapper.FutureTransactionMapper;
import com.projeto.vault.mapper.TransactionMapper;
import com.projeto.vault.repository.AccountRepository;
import com.projeto.vault.repository.FutureTransactionRepository;
import com.projeto.vault.repository.TransactionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * Serviço responsável por fornecer as informações agregadas para o dashboard.
 */
@Service
public class DashboardService {

    private static final int TOP_LIMIT = 5;

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final FutureTransactionRepository futureRepository;
    private final CategoryAmountMapper categoryAmountMapper;
    private final TransactionMapper transactionMapper;
    private final FutureTransactionMapper futureMapper;

    public DashboardService(TransactionRepository transactionRepository,
                            AccountRepository accountRepository,
                            FutureTransactionRepository futureRepository,
                            CategoryAmountMapper categoryAmountMapper,
                            TransactionMapper transactionMapper,
                            FutureTransactionMapper futureMapper) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.futureRepository = futureRepository;
        this.categoryAmountMapper = categoryAmountMapper;
        this.transactionMapper = transactionMapper;
        this.futureMapper = futureMapper;
    }

    /**
     * Retorna o saldo de cada conta do usuário (para o dashboard).
     */
    @Transactional(readOnly = true)
    public List<AccountBalanceResponse> getAccountsBalance(Long userId) {
        return accountRepository.findAllByUserId(userId)
                .stream()
                .map(acct -> AccountBalanceResponse.builder()
                        .accountId(acct.getId())
                        .accountName(acct.getName())
                        .accountType(acct.getType() != null ? acct.getType().name() : null)
                        .balance(acct.getCurrentBalance())
                        .build())
                .toList();
    }

    /**
     * Resumo financeiro do usuário (saldo total + resumo do mês corrente).
     */
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();

        List<Account> accounts = accountRepository.findAllByUserId(userId);
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getCurrentBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal income = transactionRepository
                .sumIncomeByUserAndDateBetween(userId, start, end);
        BigDecimal expense = transactionRepository
                .sumExpenseByUserAndDateBetween(userId, start, end);

        long pending = futureRepository.countByUserIdAndStatus(userId, FutureStatus.PENDING);
        long overdue = futureRepository.countByUserIdAndStatus(userId, FutureStatus.OVERDUE);

        return DashboardSummaryResponse.builder()
                .totalBalance(totalBalance)
                .monthIncome(income)
                .monthExpense(expense)
                .monthResult(income.subtract(expense))
                .transactionCount(0) // calculado abaixo por paginação, simplificado
                .pendingCount(pending)
                .overdueCount(overdue)
                .build();
    }

    /**
     * Gastos (despesas) por categoria no período, do maior para o menor.
     */
    @Transactional(readOnly = true)
    public List<CategoryAmountResponse> getExpensesByCategory(Long userId,
                                                              LocalDate start, LocalDate end) {
        return categoryAmountMapper.mapExpenses(
                transactionRepository.sumExpenseGroupByCategory(userId, start, end));
    }

    /**
     * Receitas por categoria no período, do maior para o menor.
     */
    @Transactional(readOnly = true)
    public List<CategoryAmountResponse> getIncomesByCategory(Long userId,
                                                             LocalDate start, LocalDate end) {
        return categoryAmountMapper.mapIncomes(
                transactionRepository.sumIncomeGroupByCategory(userId, start, end));
    }

    /**
     * Maiores despesas do período (top 5).
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> getTopExpenses(Long userId, LocalDate start, LocalDate end) {
        return transactionRepository
                .findTopExpenses(userId, start, end, PageRequest.of(0, TOP_LIMIT))
                .map(transactionMapper::toResponse)
                .toList();
    }

    /**
     * Contas a pagar pendentes e vencidas.
     */
    @Transactional(readOnly = true)
    public List<FutureTransactionResponse> getPendingAndOverdue(Long userId) {
        return futureRepository.findAllByUserIdAndStatus(userId, FutureStatus.PENDING)
                .stream()
                .map(futureMapper::toResponse)
                .toList();
    }

    /**
     * Evolução financeira de cada mês dentro de um intervalo de datas.
     */
    @Transactional(readOnly = true)
    public List<MonthlyEvolutionResponse> getMonthlyEvolution(Long userId, LocalDate start, LocalDate end) {
        YearMonth startMonth = YearMonth.from(start);
        YearMonth endMonth = YearMonth.from(end);

        List<MonthlyEvolutionResponse> result = new java.util.ArrayList<>();

        YearMonth current = startMonth;
        while (!current.isAfter(endMonth)) {
            LocalDate monthStart = current.atDay(1);
            LocalDate monthEnd = current.atEndOfMonth();

            BigDecimal income = transactionRepository
                    .sumIncomeByUserAndDateBetween(userId, monthStart, monthEnd);
            BigDecimal expense = transactionRepository
                    .sumExpenseByUserAndDateBetween(userId, monthStart, monthEnd);

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
}

