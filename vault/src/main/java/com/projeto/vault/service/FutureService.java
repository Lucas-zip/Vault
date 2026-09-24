package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateFutureTransactionRequest;
import com.projeto.vault.dto.request.UpdateFutureTransactionRequest;
import com.projeto.vault.dto.response.FutureTransactionResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.Category;
import com.projeto.vault.entity.FutureTransaction;
import com.projeto.vault.entity.Transaction;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.FutureStatus;
import com.projeto.vault.enums.TransactionType;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.FutureTransactionMapper;
import com.projeto.vault.mapper.TransactionMapper;
import com.projeto.vault.repository.AccountRepository;
import com.projeto.vault.repository.CategoryRepository;
import com.projeto.vault.repository.FutureTransactionRepository;
import com.projeto.vault.repository.TransactionRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Serviço responsável pelas contas a pagar e a receber.
 */
@Service
public class FutureService {

    private final FutureTransactionRepository futureRepository;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final FutureTransactionMapper futureMapper;
    private final TransactionMapper transactionMapper;
    private final BalanceService balanceService;

    public FutureService(FutureTransactionRepository futureRepository,
                         TransactionRepository transactionRepository,
                         AccountRepository accountRepository,
                         CategoryRepository categoryRepository,
                         UserRepository userRepository,
                         FutureTransactionMapper futureMapper,
                         TransactionMapper transactionMapper,
                         BalanceService balanceService) {
        this.futureRepository = futureRepository;
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.futureMapper = futureMapper;
        this.transactionMapper = transactionMapper;
        this.balanceService = balanceService;
    }

    @Transactional
    public FutureTransactionResponse create(Long userId, CreateFutureTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        Account account = request.getAccountId() != null
                ? findOwnedAccount(userId, request.getAccountId()) : null;
        Category category = request.getCategoryId() != null
                ? findOwnedCategory(userId, request.getCategoryId()) : null;

        FutureTransaction future = FutureTransaction.builder()
                .user(user)
                .account(account)
                .category(category)
                .description(request.getDescription())
                .amount(request.getAmount())
                .dueDate(request.getDueDate())
                .type(request.getType())
                .status(FutureStatus.PENDING)
                .build();

        FutureTransaction saved = futureRepository.save(future);
        return futureMapper.toResponse(saved);
    }

    /**
     * Lista contas a pagar/receber, com filtro opcional por status e por tipo.
     */
    @Transactional(readOnly = true)
    public List<FutureTransactionResponse> findAll(Long userId, FutureStatus status, TransactionType type) {
        List<FutureTransaction> futures;
        if (status != null) {
            futures = futureRepository.findAllByUserIdAndStatus(userId, status);
        } else {
            futures = futureRepository.findAllByUserId(userId);
        }

        return futures.stream()
                .filter(f -> type == null || f.getType() == type)
                .map(futureMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FutureTransactionResponse findById(Long userId, Long futureId) {
        FutureTransaction future = findOwnedFuture(userId, futureId);
        return futureMapper.toResponse(future);
    }

    @Transactional
    public FutureTransactionResponse update(Long userId, Long futureId, UpdateFutureTransactionRequest request) {
        FutureTransaction future = findOwnedFuture(userId, futureId);

        Account account = request.getAccountId() != null
                ? findOwnedAccount(userId, request.getAccountId()) : null;
        Category category = request.getCategoryId() != null
                ? findOwnedCategory(userId, request.getCategoryId()) : null;

        future.setDescription(request.getDescription());
        future.setAmount(request.getAmount());
        future.setDueDate(request.getDueDate());
        future.setType(request.getType());
        future.setAccount(account);
        future.setCategory(category);

        FutureTransaction saved = futureRepository.save(future);
        return futureMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long userId, Long futureId) {
        FutureTransaction future = findOwnedFuture(userId, futureId);
        futureRepository.delete(future);
    }

    /**
     * Marca a conta a pagar/receber como paga e gera a transação correspondente,
     * aplicando o impacto no saldo da conta.
     */
    @Transactional
    public TransactionResponse pay(Long userId, Long futureId) {
        FutureTransaction future = findOwnedFuture(userId, futureId);

        if (future.getStatus() == FutureStatus.PAID) {
            throw new BusinessException("Esta conta já foi paga");
        }

        if (future.getStatus() == FutureStatus.CANCELLED) {
            throw new BusinessException("Esta conta foi cancelada");
        }

        // Exige uma conta financeira para aplicar o impacto no saldo
        if (future.getAccount() == null) {
            throw new BusinessException("Defina uma conta para realizar o pagamento");
        }

        User user = future.getUser();

        // Cria a transação correspondente
        Transaction transaction = Transaction.builder()
                .user(user)
                .account(future.getAccount())
                .category(future.getCategory())
                .description(future.getDescription())
                .amount(future.getAmount())
                .type(future.getType())
                .transactionDate(LocalDate.now())
                .observation("Liquidado da conta a pagar/receber #" + future.getId())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        balanceService.applyImpact(future.getAccount(), saved.getType(), saved.getAmount());

        // Atualiza o status da conta a pagar/receber
        future.setStatus(FutureStatus.PAID);
        futureRepository.save(future);

        return transactionMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<FutureTransactionResponse> findOverdue(Long userId) {
        return futureRepository
                .findAllByUserIdAndStatusAndDueDateBefore(
                        userId, FutureStatus.PENDING, LocalDate.now())
                .stream()
                .map(futureMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FutureTransactionResponse> findUpcoming(Long userId, int days) {
        LocalDate today = LocalDate.now();
        LocalDate end = today.plusDays(days);
        return futureRepository
                .findAllByUserIdAndStatusAndDueDateBetween(
                        userId, FutureStatus.PENDING, today, end)
                .stream()
                .map(futureMapper::toResponse)
                .toList();
    }

    private FutureTransaction findOwnedFuture(Long userId, Long futureId) {
        return futureRepository.findByIdAndUserId(futureId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta a pagar/receber não encontrada"));
    }

    private Account findOwnedAccount(Long userId, Long accountId) {
        return accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
    }

    private Category findOwnedCategory(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }
}
