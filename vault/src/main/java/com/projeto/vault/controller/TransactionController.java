package com.projeto.vault.controller;

import com.projeto.vault.dto.request.CreateTransactionRequest;
import com.projeto.vault.dto.request.UpdateTransactionRequest;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.enums.TransactionType;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controller das transações financeiras.
 */
@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transações", description = "Gerenciamento de receitas e despesas")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    @Operation(summary = "Criar transação",
            description = "Uma receita aumenta o saldo; uma despesa diminui")
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody CreateTransactionRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(userId, request));
    }

    @GetMapping
    @Operation(summary = "Listar transações com filtros e paginação")
    public ResponseEntity<Page<TransactionResponse>> findAll(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long accountId,
            @PageableDefault(size = 20, sort = "transactionDate", direction = Sort.Direction.DESC)
            Pageable pageable) {

        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(transactionService.findAll(
                userId, startDate, endDate, type, categoryId, accountId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar transação por id")
    public ResponseEntity<TransactionResponse> findById(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(transactionService.findById(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar transação",
            description = "Reverte o impacto antigo no saldo e aplica o novo")
    public ResponseEntity<TransactionResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateTransactionRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(transactionService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir transação",
            description = "Reverte o impacto da transação no saldo da conta")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        transactionService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
