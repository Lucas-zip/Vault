package com.projeto.vault.controller;

import com.projeto.vault.dto.request.CreateBudgetRequest;
import com.projeto.vault.dto.response.BudgetResponse;
import com.projeto.vault.dto.response.BudgetStatusResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller dos orçamentos mensais por categoria.
 */
@RestController
@RequestMapping("/api/budgets")
@Tag(name = "Orçamentos", description = "Gerenciamento de orçamentos mensais por categoria")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Criar orçamento")
    public ResponseEntity<BudgetResponse> create(@Valid @RequestBody CreateBudgetRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(userId, request));
    }

    @GetMapping
    @Operation(summary = "Listar orçamentos do usuário")
    public ResponseEntity<List<BudgetResponse>> findAll() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(budgetService.findAll(userId));
    }

    @GetMapping("/status")
    @Operation(summary = "Listar status de todos os orçamentos",
            description = "Retorna valor utilizado, restante e percentual para cada orçamento")
    public ResponseEntity<List<BudgetStatusResponse>> getStatuses() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(budgetService.getStatuses(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Calcular utilização do orçamento")
    public ResponseEntity<BudgetStatusResponse> getStatus(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(budgetService.getStatus(userId, id));
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Calcular utilização do orçamento")
    public ResponseEntity<BudgetStatusResponse> getStatusById(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(budgetService.getStatus(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar orçamento")
    public ResponseEntity<BudgetResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateBudgetRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(budgetService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir orçamento")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        budgetService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}

