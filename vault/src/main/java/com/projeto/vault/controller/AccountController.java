package com.projeto.vault.controller;

import com.projeto.vault.dto.request.CreateAccountRequest;
import com.projeto.vault.dto.request.UpdateAccountRequest;
import com.projeto.vault.dto.response.AccountResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller das contas financeiras.
 */
@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Contas", description = "Gerenciamento de contas financeiras")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    @Operation(summary = "Criar conta financeira")
    public ResponseEntity<AccountResponse> create(@Valid @RequestBody CreateAccountRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(userId, request));
    }

    @GetMapping
    @Operation(summary = "Listar contas (paginado)")
    public ResponseEntity<Page<AccountResponse>> findAll(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(accountService.findAll(userId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar conta por id")
    public ResponseEntity<AccountResponse> findById(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(accountService.findById(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar conta")
    public ResponseEntity<AccountResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateAccountRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(accountService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir conta")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        accountService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
