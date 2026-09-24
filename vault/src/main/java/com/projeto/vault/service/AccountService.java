package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateAccountRequest;
import com.projeto.vault.dto.request.UpdateAccountRequest;
import com.projeto.vault.dto.response.AccountResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.User;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.AccountMapper;
import com.projeto.vault.repository.AccountRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável pelas operações de contas financeiras.
 *
 * <p>Garante que o usuário autenticado só acesse as próprias contas.</p>
 */
@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountMapper accountMapper;

    public AccountService(AccountRepository accountRepository,
                          UserRepository userRepository,
                          AccountMapper accountMapper) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountMapper = accountMapper;
    }

    @Transactional
    public AccountResponse create(Long userId, CreateAccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Account account = accountMapper.toEntity(request, user);

        Account saved = accountRepository.save(account);
        return accountMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<AccountResponse> findAll(Long userId, Pageable pageable) {
        return accountRepository.findAllByUserId(userId, pageable)
                .map(accountMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(Long userId, Long accountId) {
        Account account = findOwnedAccount(userId, accountId);
        return accountMapper.toResponse(account);
    }

    @Transactional
    public AccountResponse update(Long userId, Long accountId, UpdateAccountRequest request) {
        Account account = findOwnedAccount(userId, accountId);

        account.setName(request.getName());
        account.setType(request.getType());
        account.setInstitution(request.getInstitution());
        account.setDescription(request.getDescription());

        Account saved = accountRepository.save(account);
        return accountMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long userId, Long accountId) {
        Account account = findOwnedAccount(userId, accountId);

        // Regra de negócio: não permite excluir conta com transações
        if (account.getTransactions() != null && !account.getTransactions().isEmpty()) {
            throw new BusinessException("Não é possível excluir uma conta que possui transações");
        }

        accountRepository.delete(account);
    }

    /**
     * Busca uma conta garantindo que pertence ao usuário informado.
     */
    private Account findOwnedAccount(Long userId, Long accountId) {
        return accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
    }
}
