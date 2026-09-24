package com.projeto.vault.controller;

import com.projeto.vault.dto.response.AccountBalanceResponse;
import com.projeto.vault.dto.response.CategoryAmountResponse;
import com.projeto.vault.dto.response.DashboardSummaryResponse;
import com.projeto.vault.dto.response.FutureTransactionResponse;
import com.projeto.vault.dto.response.MonthlyEvolutionResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

/**
 * Controller do dashboard financeiro.
 */
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Informações agregadas para o painel financeiro")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Resumo financeiro",
            description = "Saldo total, receitas/despesas e resultado do mês corrente")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(dashboardService.getSummary(userId));
    }

    @GetMapping("/categories")
    @Operation(summary = "Gastos e receitas por categoria")
    public ResponseEntity<List<CategoryAmountResponse>> getCategoriesByPeriod(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = SecurityUtils.getAuthenticatedUserId();

        // Se não informar período, usa o mês corrente
        if (startDate == null || endDate == null) {
            YearMonth current = YearMonth.now();
            startDate = current.atDay(1);
            endDate = current.atEndOfMonth();
        }

        return ResponseEntity.ok(dashboardService.getExpensesByCategory(userId, startDate, endDate));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Evolução financeira mensal")
    public ResponseEntity<List<MonthlyEvolutionResponse>> getMonthlyEvolution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(dashboardService.getMonthlyEvolution(userId, startDate, endDate));
    }

    @GetMapping("/accounts")
    @Operation(summary = "Saldo de cada conta do usuário")
    public ResponseEntity<List<AccountBalanceResponse>> getAccounts() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(dashboardService.getAccountsBalance(userId));
    }

    @GetMapping("/top-expenses")
    @Operation(summary = "Maiores despesas do período")
    public ResponseEntity<List<TransactionResponse>> getTopExpenses(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(dashboardService.getTopExpenses(userId, startDate, endDate));
    }

    @GetMapping("/pending")
    @Operation(summary = "Despesas pendentes e contas vencidas")
    public ResponseEntity<List<FutureTransactionResponse>> getPending() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(dashboardService.getPendingAndOverdue(userId));
    }
}
