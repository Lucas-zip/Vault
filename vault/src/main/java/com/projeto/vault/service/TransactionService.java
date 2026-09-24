 package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateTransactionRequest;
import com.projeto.vault.dto.request.UpdateTransactionRequest;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.Category;
import com.projeto.vault.entity.Transaction;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.TransactionType;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.TransactionMapper;
import com.projeto.vault.repository.AccountRepository;
import com.projeto.vault.repository.CategoryRepository;
import com.projeto.vault.repository.TransactionRepository;
import com.projeto.vault.repository.UserRepository;
import com.projeto.vault.specification.TransactionSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Serviço responsável pelas operações de transações financeiras.
 *
 * <p>Orquestra a atualização dos saldos via {@link BalanceService}:
 * ao criar, alterar ou excluir uma transação, o impacto no saldo da
 * conta é revertido (se existia) e reaplicado corretamente.</p>
 */
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;
    private final BalanceService balanceService;

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              CategoryRepository categoryRepository,
                              UserRepository userRepository,
                              TransactionMapper transactionMapper,
                              BalanceService balanceService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.transactionMapper = transactionMapper;
        this.balanceService = balanceService;
    }

    @Transactional
    public TransactionResponse create(Long userId, CreateTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Account account = findOwnedAccount(userId, request.getAccountId());
        Category category = resolveCategory(userId, request.getCategoryId());

        Transaction transaction = Transaction.builder()
                .user(user)
                .account(account)
                .category(category)
                .description(request.getDescription())
                .amount(request.getAmount())
                .type(request.getType())
                .transactionDate(request.getTransactionDate() != null
                        ? request.getTransactionDate() : LocalDate.now())
                .observation(request.getObservation())
                .build();

        Transaction saved = transactionRepository.save(transaction);

        // Aplica o impacto no saldo da conta
        balanceService.applyImpact(account, saved.getType(), saved.getAmount());

        return transactionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> findAll(Long userId, LocalDate startDate, LocalDate endDate,
                                             TransactionType type, Long categoryId, Long accountId,
                                             Pageable pageable) {
        return transactionRepository.findAll(
                        TransactionSpecification.withFilters(
                                userId, startDate, endDate, type, categoryId, accountId),
                        pageable)
                .map(transactionMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(Long userId, Long transactionId) {
        Transaction transaction = findOwnedTransaction(userId, transactionId);
        return transactionMapper.toResponse(transaction);
    }

    @Transactional
    public TransactionResponse update(Long userId, Long transactionId, UpdateTransactionRequest request) {
        Transaction transaction = findOwnedTransaction(userId, transactionId);

        // 1. Reverte o impacto da transação antiga
        Account oldAccount = transaction.getAccount();
        balanceService.revertImpact(oldAccount, transaction.getType(), transaction.getAmount());

        // 2. Resolve os novos dados
        Account newAccount = findOwnedAccount(userId, request.getAccountId());
        Category newCategory = resolveCategory(userId, request.getCategoryId());

        // 3. Aplica os novos valores
        transaction.setDescription(request.getDescription());
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setObservation(request.getObservation());
        transaction.setAccount(newAccount);
        transaction.setCategory(newCategory);

        Transaction saved = transactionRepository.save(transaction);

        // 4. Aplica o novo impacto no saldo
        balanceService.applyImpact(saved.getAccount(), saved.getType(), saved.getAmount());

        return transactionMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long userId, Long transactionId) {
        Transaction transaction = findOwnedTransaction(userId, transactionId);

        // Reverte o impacto da transação no saldo da conta
        balanceService.revertImpact(transaction.getAccount(), transaction.getType(), transaction.getAmount());

        transactionRepository.delete(transaction);
    }

    private Transaction findOwnedTransaction(Long userId, Long transactionId) {
        return transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));
    }

    private Account findOwnedAccount(Long userId, Long accountId) {
        return accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
    }

    private Category resolveCategory(Long userId, Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }
}
