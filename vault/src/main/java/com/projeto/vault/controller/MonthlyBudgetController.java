package com.projeto.vault.controller;

import com.projeto.vault.dto.request.UpsertMonthlyBudgetRequest;
import com.projeto.vault.dto.response.MonthlyBudgetStatusResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.MonthlyBudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller do limite mensal total de gastos.
 *
 * <p>Permite definir, editar, consultar e remover o teto de despesas de um mês.</p>
 */
@RestController
@RequestMapping("/api/monthly-budget")
@Tag(name = "Limite Mensal", description = "Limite máximo de gastos por mês")
public class MonthlyBudgetController {

    private final MonthlyBudgetService monthlyBudgetService;

    public MonthlyBudgetController(MonthlyBudgetService monthlyBudgetService) {
        this.monthlyBudgetService = monthlyBudgetService;
    }

    @GetMapping
    @Operation(summary = "Status do limite do mês corrente",
            description = "Retorna limite, total gasto, restante/excedido do mês atual")
    public ResponseEntity<MonthlyBudgetStatusResponse> getCurrent() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(monthlyBudgetService.getCurrentStatus(userId));
    }

    @GetMapping("/{period}")
    @Operation(summary = "Status do limite de um período (YYYY-MM)")
    public ResponseEntity<MonthlyBudgetStatusResponse> getByPeriod(@PathVariable String period) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(monthlyBudgetService.getStatus(userId, period));
    }

    @PutMapping
    @Operation(summary = "Definir ou atualizar o limite mensal",
            description = "Cria ou atualiza o limite do período informado (padrão: mês corrente)")
    public ResponseEntity<MonthlyBudgetStatusResponse> upsert(
            @Valid @RequestBody UpsertMonthlyBudgetRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(monthlyBudgetService.upsert(userId, request));
    }

    @DeleteMapping("/{period}")
    @Operation(summary = "Remover o limite de um período")
    public ResponseEntity<Void> delete(@PathVariable String period) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        monthlyBudgetService.delete(userId, period);
        return ResponseEntity.noContent().build();
    }
}
