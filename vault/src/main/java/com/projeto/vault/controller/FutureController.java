package com.projeto.vault.controller;

import com.projeto.vault.dto.request.CreateFutureTransactionRequest;
import com.projeto.vault.dto.request.UpdateFutureTransactionRequest;
import com.projeto.vault.dto.response.FutureTransactionResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.enums.FutureStatus;
import com.projeto.vault.enums.TransactionType;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.FutureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller de contas a pagar e a receber.
 */
@RestController
@RequestMapping("/api/futures")
@Tag(name = "Contas a Pagar/Receber", description = "Gerenciamento de compromissos financeiros")
public class FutureController {

    private final FutureService futureService;

    public FutureController(FutureService futureService) {
        this.futureService = futureService;
    }

    @PostMapping
    @Operation(summary = "Criar conta a pagar ou a receber")
    public ResponseEntity<FutureTransactionResponse> create(
            @Valid @RequestBody CreateFutureTransactionRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(futureService.create(userId, request));
    }

    @GetMapping
    @Operation(summary = "Listar contas a pagar/receber com filtros")
    public ResponseEntity<List<FutureTransactionResponse>> findAll(
            @RequestParam(required = false) FutureStatus status,
            @RequestParam(required = false) TransactionType type) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(futureService.findAll(userId, status, type));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Listar contas vencidas")
    public ResponseEntity<List<FutureTransactionResponse>> findOverdue() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(futureService.findOverdue(userId));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Listar próximos vencimentos")
    public ResponseEntity<List<FutureTransactionResponse>> findUpcoming(
            @RequestParam(defaultValue = "30") int days) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(futureService.findUpcoming(userId, days));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar conta a pagar/receber por id")
    public ResponseEntity<FutureTransactionResponse> findById(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(futureService.findById(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar conta a pagar/receber")
    public ResponseEntity<FutureTransactionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFutureTransactionRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(futureService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir conta a pagar/receber")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        futureService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "Marcar como pago e gerar transação",
            description = "Gera a transação e aplica o impacto no saldo")
    public ResponseEntity<TransactionResponse> pay(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(futureService.pay(userId, id));
    }
}
