package com.projeto.vault.controller;

import com.projeto.vault.dto.response.CategoryAmountResponse;
import com.projeto.vault.dto.response.MonthlyEvolutionResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller dos relatórios financeiros.
 */
@RestController
@RequestMapping("/api/reports")
@Tag(name = "Relatórios", description = "Relatórios financeiros por período")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Resumo de receitas, despesas e resultado")
    public ResponseEntity<Map<String, BigDecimal>> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reportService.getSummary(userId, startDate, endDate));
    }

    @GetMapping("/expenses")
    @Operation(summary = "Gastos por categoria")
    public ResponseEntity<List<CategoryAmountResponse>> getExpensesByCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reportService.getExpensesByCategory(userId, startDate, endDate));
    }

    @GetMapping("/incomes")
    @Operation(summary = "Receitas por categoria")
    public ResponseEntity<List<CategoryAmountResponse>> getIncomesByCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reportService.getIncomesByCategory(userId, startDate, endDate));
    }

    @GetMapping("/monthly-evolution")
    @Operation(summary = "Evolução financeira mensal")
    public ResponseEntity<List<MonthlyEvolutionResponse>> getMonthlyEvolution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reportService.getMonthlyEvolution(userId, startDate, endDate));
    }

    @GetMapping("/top-expenses")
    @Operation(summary = "Maiores despesas do período")
    public ResponseEntity<List<TransactionResponse>> getTopExpenses(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reportService.getTopExpenses(userId, startDate, endDate));
    }

    @GetMapping("/top-incomes")
    @Operation(summary = "Maiores receitas do período")
    public ResponseEntity<List<TransactionResponse>> getTopIncomes(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(reportService.getTopIncomes(userId, startDate, endDate));
    }
}
