package com.projeto.vault.mapper;

import com.projeto.vault.dto.request.CreateAccountRequest;
import com.projeto.vault.dto.response.AccountResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper de conversão entre {@link Account} e seus DTOs.
 */
@Component
public class AccountMapper {

    public AccountResponse toResponse(Account account) {
        if (account == null) {
            return null;
        }
        return AccountResponse.builder()
                .id(account.getId())
                .name(account.getName())
                .type(account.getType() != null ? account.getType().name() : null)
                .initialBalance(account.getInitialBalance())
                .currentBalance(account.getCurrentBalance())
                .institution(account.getInstitution())
                .description(account.getDescription())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .build();
    }

    /**
     * Constrói uma entidade Account a partir do request de criação.
     * O usuário dono é passado explicitamente (vindo do contexto autenticado).
     */
    public Account toEntity(CreateAccountRequest request, User user) {
        if (request == null) {
            return null;
        }
        Account account = new Account();
        account.setUser(user);
        account.setName(request.getName());
        account.setType(request.getType());
        account.setInitialBalance(request.getInitialBalance() != null ? request.getInitialBalance() : java.math.BigDecimal.ZERO);
        account.setInstitution(request.getInstitution());
        account.setDescription(request.getDescription());
        return account;
    }
}
