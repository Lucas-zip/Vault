package com.projeto.vault.service;

import com.projeto.vault.entity.Account;
import com.projeto.vault.enums.TransactionType;
import com.projeto.vault.exception.InvalidTransactionException;
import com.projeto.vault.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Serviço responsável por aplicar ou reverter o impacto de transações
 * no saldo das contas financeiras.
 *
 * <p>Todas as alterações de saldo devem passar por aqui, garantindo
 * consistência e alta coesão (uma única fonte de verdade para o saldo).</p>
 */
@Service
public class BalanceService {

    private final AccountRepository accountRepository;

    public BalanceService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * Aplica o impacto de uma nova transação no saldo da conta.
     *
     * @param type receita adiciona; despesa subtrai.
     */
    @Transactional
    public void applyImpact(Account account, TransactionType type, BigDecimal amount) {
        BigDecimal newBalance = switch (type) {
            case INCOME -> account.getCurrentBalance().add(amount);
            case EXPENSE -> {
                BigDecimal result = account.getCurrentBalance().subtract(amount);
                if (result.compareTo(BigDecimal.ZERO) < 0) {
                    throw new InvalidTransactionException("Saldo insuficiente para esta despesa");
                }
                yield result;
            }
        };
        account.setCurrentBalance(newBalance);
        accountRepository.save(account);
    }

    /**
     * Reverte o impacto de uma transação existente (usado ao alterar/excluir).
     *
     * @param type o tipo ORIGINAL da transação que será desfeita.
     */
    @Transactional
    public void revertImpact(Account account, TransactionType type, BigDecimal amount) {
        BigDecimal newBalance = switch (type) {
            // Se era uma receita adicionada, removemos para reverter
            case INCOME -> account.getCurrentBalance().subtract(amount);
            // Se era uma despesa subtraída, devolvemos para reverter
            case EXPENSE -> account.getCurrentBalance().add(amount);
        };
        account.setCurrentBalance(newBalance);
        accountRepository.save(account);
    }
}
