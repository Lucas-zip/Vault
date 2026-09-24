package com.projeto.vault.service;

import com.projeto.vault.dto.request.TransferRequest;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.Transaction;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.TransactionType;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.TransactionMapper;
import com.projeto.vault.repository.AccountRepository;
import com.projeto.vault.repository.TransactionRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Serviço responsável pelas transferências entre contas de um mesmo usuário.
 *
 * <p>A transferência é modelada como duas transações atômicas:
 * uma despesa (saída) na conta de origem e uma receita (entrada) na
 * conta de destino. Ambas são persistidas na mesma transação JPA.</p>
 */
@Service
public class TransferService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final BalanceService balanceService;
    private final TransactionMapper transactionMapper;

    public TransferService(AccountRepository accountRepository,
                           TransactionRepository transactionRepository,
                           UserRepository userRepository,
                           BalanceService balanceService,
                           TransactionMapper transactionMapper) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.balanceService = balanceService;
        this.transactionMapper = transactionMapper;
    }

    /**
     * Realiza uma transferência entre duas contas do mesmo usuário.
     *
     * @param result retorna a transação de entrada no destino.
     */
    @Transactional
    public TransactionResponse transfer(Long userId, TransferRequest request) {
        // Conta de origem deve pertencer ao usuário
        Account fromAccount = accountRepository.findByIdAndUserId(request.getFromAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta de origem não encontrada"));

        // Conta de destino deve pertencer ao usuário
        Account toAccount = accountRepository.findByIdAndUserId(request.getToAccountId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta de destino não encontrada"));

        if (fromAccount.getId().equals(toAccount.getId())) {
            throw new BusinessException("As contas de origem e destino devem ser diferentes");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        LocalDate date = request.getTransactionDate() != null ? request.getTransactionDate() : LocalDate.now();
        String description = request.getDescription() != null && !request.getDescription().isBlank()
                ? request.getDescription() : "Transferência entre contas";

        // 1. Saída na origem (despesa) — aplica impacto e valida saldo
        Transaction out = Transaction.builder()
                .user(user)
                .account(fromAccount)
                .description("Transferência: " + description)
                .amount(request.getAmount())
                .type(TransactionType.EXPENSE)
                .transactionDate(date)
                .observation("Transferência para conta de destino")
                .build();
        Transaction savedOut = transactionRepository.save(out);
        balanceService.applyImpact(fromAccount, TransactionType.EXPENSE, request.getAmount());

        // 2. Entrada no destino (receita)
        Transaction in = Transaction.builder()
                .user(user)
                .account(toAccount)
                .description("Transferência: " + description)
                .amount(request.getAmount())
                .type(TransactionType.INCOME)
                .transactionDate(date)
                .observation("Transferência da conta de origem")
                .build();
        Transaction savedIn = transactionRepository.save(in);
        balanceService.applyImpact(toAccount, TransactionType.INCOME, request.getAmount());

        return transactionMapper.toResponse(savedIn);
    }
}
