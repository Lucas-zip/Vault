package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateTransactionRequest;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.Transaction;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.TransactionType;
import com.projeto.vault.mapper.TransactionMapper;
import com.projeto.vault.repository.AccountRepository;
import com.projeto.vault.repository.CategoryRepository;
import com.projeto.vault.repository.TransactionRepository;
import com.projeto.vault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Testes unitários do {@link TransactionService}, focando na regra
 * de criação de transações e impacto no saldo.
 */
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private AccountRepository accountRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private TransactionMapper transactionMapper;
    @Mock private BalanceService balanceService;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Account account;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).name("João").build();

        account = Account.builder()
                .id(10L)
                .user(user)
                .name("Conta Corrente")
                .initialBalance(new BigDecimal("1000.00"))
                .currentBalance(new BigDecimal("1000.00"))
                .build();
    }

    @Test
    @DisplayName("Deve criar uma despesa e aplicar impacto no saldo")
    void create_shouldCreateExpenseAndApplyImpact() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setDescription("Almoço");
        request.setAmount(new BigDecimal("50.00"));
        request.setType(TransactionType.EXPENSE);
        request.setAccountId(10L);
        request.setTransactionDate(LocalDate.of(2025, 1, 15));

        Transaction saved = Transaction.builder()
                .id(100L)
                .user(user)
                .account(account)
                .description("Almoço")
                .amount(new BigDecimal("50.00"))
                .type(TransactionType.EXPENSE)
                .transactionDate(LocalDate.of(2025, 1, 15))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse expected = new TransactionResponse();
        expected.setId(100L);
        when(transactionMapper.toResponse(saved)).thenReturn(expected);

        TransactionResponse result = transactionService.create(1L, request);

        assertThat(result).isNotNull();
        // Confirma que o impacto no saldo foi aplicado
        verify(balanceService).applyImpact(account, TransactionType.EXPENSE, new BigDecimal("50.00"));
    }

    @Test
    @DisplayName("Deve criar uma receita e aplicar impacto no saldo")
    void create_shouldCreateIncomeAndApplyImpact() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setDescription("Salário");
        request.setAmount(new BigDecimal("3000.00"));
        request.setType(TransactionType.INCOME);
        request.setAccountId(10L);
        request.setTransactionDate(LocalDate.of(2025, 1, 5));

        Transaction saved = Transaction.builder()
                .id(101L)
                .user(user)
                .account(account)
                .description("Salário")
                .amount(new BigDecimal("3000.00"))
                .type(TransactionType.INCOME)
                .transactionDate(LocalDate.of(2025, 1, 5))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(saved);

        TransactionResponse expected = new TransactionResponse();
        expected.setId(101L);
        when(transactionMapper.toResponse(saved)).thenReturn(expected);

        TransactionResponse result = transactionService.create(1L, request);

        assertThat(result).isNotNull();
        verify(balanceService).applyImpact(account, TransactionType.INCOME, new BigDecimal("3000.00"));
    }

    @Test
    @DisplayName("Deve usar a data de hoje quando não informada")
    void create_shouldUseTodayWhenDateNotInformed() {
        CreateTransactionRequest request = new CreateTransactionRequest();
        request.setDescription("Mercado");
        request.setAmount(new BigDecimal("80.00"));
        request.setType(TransactionType.EXPENSE);
        request.setAccountId(10L);
        request.setTransactionDate(null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(accountRepository.findByIdAndUserId(10L, 1L)).thenReturn(Optional.of(account));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> inv.getArgument(0));

        transactionService.create(1L, request);

        // Verifica que a transação salva usou a data de hoje
        verify(transactionRepository).save(any(Transaction.class));
    }
}
