package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateBudgetRequest;
import com.projeto.vault.dto.response.BudgetResponse;
import com.projeto.vault.dto.response.BudgetStatusResponse;
import com.projeto.vault.entity.Budget;
import com.projeto.vault.entity.Category;
import com.projeto.vault.entity.User;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.BudgetMapper;
import com.projeto.vault.repository.BudgetRepository;
import com.projeto.vault.repository.CategoryRepository;
import com.projeto.vault.repository.TransactionRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Serviço responsável pelos orçamentos mensais por categoria.
 *
 * <p>Calcula o valor utilizado (soma de despesas da categoria no mês),
 * o valor restante e o percentual utilizado, identificando quando o
 * limite é ultrapassado.</p>
 */
@Service
public class BudgetService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BudgetMapper budgetMapper;

    public BudgetService(BudgetRepository budgetRepository,
                         CategoryRepository categoryRepository,
                         TransactionRepository transactionRepository,
                         UserRepository userRepository,
                         BudgetMapper budgetMapper) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.budgetMapper = budgetMapper;
    }

    @Transactional
    public BudgetResponse create(Long userId, CreateBudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        // Não permite mais de um orçamento para a mesma categoria no mesmo período
        if (budgetRepository.existsByUserIdAndCategoryIdAndPeriod(userId, request.getCategoryId(), request.getPeriod())) {
            throw new BusinessException("Já existe um orçamento para esta categoria no período informado");
        }

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .limitAmount(request.getLimitAmount())
                .period(request.getPeriod())
                .build();

        Budget saved = budgetRepository.save(budget);
        return budgetMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> findAll(Long userId) {
        return budgetRepository.findAllByUserId(userId)
                .stream()
                .map(budgetMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BudgetStatusResponse getStatus(Long userId, Long budgetId) {
        Budget budget = findOwnedBudget(userId, budgetId);
        return computeStatus(userId, budget);
    }

    @Transactional(readOnly = true)
    public List<BudgetStatusResponse> getStatuses(Long userId) {
        List<Budget> budgets = budgetRepository.findAllByUserId(userId);
        return budgets.stream()
                .map(budget -> computeStatus(userId, budget))
                .toList();
    }

    @Transactional
    public BudgetResponse update(Long userId, Long budgetId, CreateBudgetRequest request) {
        Budget budget = findOwnedBudget(userId, budgetId);

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        budget.setCategory(category);
        budget.setLimitAmount(request.getLimitAmount());
        budget.setPeriod(request.getPeriod());

        Budget saved = budgetRepository.save(budget);
        return budgetMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long userId, Long budgetId) {
        Budget budget = findOwnedBudget(userId, budgetId);
        budgetRepository.delete(budget);
    }

    /**
     * Calcula as métricas de utilização do orçamento.
     */
    private BudgetStatusResponse computeStatus(Long userId, Budget budget) {
        // Determina o início e fim do período 'YYYY-MM'
        int year = Integer.parseInt(budget.getPeriod().substring(0, 4));
        int month = Integer.parseInt(budget.getPeriod().substring(5, 7));
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        BigDecimal used = transactionRepository
                .sumExpenseByUserAndCategoryAndDateBetween(
                        userId, budget.getCategory().getId(), start, end);

        BigDecimal remaining = budget.getLimitAmount().subtract(used);

        BigDecimal percentage = BigDecimal.ZERO;
        if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentage = used.multiply(HUNDRED)
                    .divide(budget.getLimitAmount(), 2, RoundingMode.HALF_UP);
        }

        boolean exceeded = used.compareTo(budget.getLimitAmount()) > 0;

        return BudgetStatusResponse.builder()
                .budgetId(budget.getId())
                .categoryName(budget.getCategory().getName())
                .period(budget.getPeriod())
                .limitAmount(budget.getLimitAmount())
                .usedAmount(used)
                .remainingAmount(remaining)
                .percentageUsed(percentage)
                .exceeded(exceeded)
                .build();
    }

    private Budget findOwnedBudget(Long userId, Long budgetId) {
        return budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado"));
    }
}
