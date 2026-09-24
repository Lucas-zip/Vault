package com.projeto.vault.controller;

import com.projeto.vault.dto.request.CreateRecurrenceRequest;
import com.projeto.vault.dto.request.UpdateRecurrenceRequest;
import com.projeto.vault.dto.response.RecurrenceResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.RecurrenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller das transações recorrentes.
 */
@RestController
@RequestMapping("/api/recurrences")
@Tag(name = "Recorrências", description = "Gerenciamento de receitas e despesas recorrentes")
public class RecurrenceController {

    private final RecurrenceService recurrenceService;

    public RecurrenceController(RecurrenceService recurrenceService) {
        this.recurrenceService = recurrenceService;
    }

    @PostMapping
    @Operation(summary = "Criar recorrência")
    public ResponseEntity<RecurrenceResponse> create(
            @Valid @RequestBody CreateRecurrenceRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(recurrenceService.create(userId, request));
    }

    @GetMapping
    @Operation(summary = "Listar recorrências do usuário")
    public ResponseEntity<List<RecurrenceResponse>> findAll() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(recurrenceService.findAll(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar recorrência por id")
    public ResponseEntity<RecurrenceResponse> findById(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(recurrenceService.findById(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar recorrência")
    public ResponseEntity<RecurrenceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRecurrenceRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(recurrenceService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir recorrência")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        recurrenceService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/execute")
    @Operation(summary = "Executar recorrência",
            description = "Gera as transações recorrentes e aplica o impacto no saldo")
    public ResponseEntity<List<TransactionResponse>> execute(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(recurrenceService.execute(userId, id));
    }
}
