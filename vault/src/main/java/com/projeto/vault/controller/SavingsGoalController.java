package com.projeto.vault.controller;

import com.projeto.vault.dto.request.CreateGoalMovementRequest;
import com.projeto.vault.dto.request.CreateGoalRequest;
import com.projeto.vault.dto.request.GenerateDepositPlanRequest;
import com.projeto.vault.dto.request.GenerateSlotPlanRequest;
import com.projeto.vault.dto.request.InvestmentSimulationRequest;
import com.projeto.vault.dto.request.UpdateDepositPlanRequest;
import com.projeto.vault.dto.request.UpdateGoalRequest;
import com.projeto.vault.dto.request.UpdateSlotRequest;
import com.projeto.vault.dto.response.GoalDepositPlanResponse;
import com.projeto.vault.dto.response.GoalDetailResponse;
import com.projeto.vault.dto.response.GoalResponse;
import com.projeto.vault.dto.response.GoalSlotPlanResponse;
import com.projeto.vault.dto.response.GoalSummaryResponse;
import com.projeto.vault.dto.response.InvestmentSimulationResponse;
import com.projeto.vault.enums.GoalStatus;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.InvestmentCalculator;
import com.projeto.vault.service.SavingsGoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller das metas financeiras (caixinhas).
 *
 * <p>Inclui o CRUD das metas, movimentações (depósitos/retiradas),
 * resumo do dashboard, calendário de depósitos e a calculadora de
 * investimentos (inspirada na calculadora "Primeiro Milhão").</p>
 */
@RestController
@RequestMapping("/api/goals")
@Tag(name = "Metas Financeiras", description = "Gerenciamento de metas financeiras (caixinhas)")
public class SavingsGoalController {

    private final SavingsGoalService goalService;
    private final InvestmentCalculator investmentCalculator;

    public SavingsGoalController(SavingsGoalService goalService,
                                 InvestmentCalculator investmentCalculator) {
        this.goalService = goalService;
        this.investmentCalculator = investmentCalculator;
    }

    // ==================== CRUD ====================

    @PostMapping
    @Operation(summary = "Criar meta financeira")
    public ResponseEntity<GoalResponse> create(@Valid @RequestBody CreateGoalRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(goalService.create(userId, request));
    }

    @GetMapping
    @Operation(summary = "Listar metas do usuário", description = "Filtro opcional por status")
    public ResponseEntity<List<GoalResponse>> findAll(
            @RequestParam(required = false) GoalStatus status) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.findAll(userId, status));
    }

    @GetMapping("/summary")
    @Operation(summary = "Resumo das metas (dashboard)")
    public ResponseEntity<GoalSummaryResponse> summary() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.summary(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalhe da meta", description = "Inclui histórico e calendário de depósitos")
    public ResponseEntity<GoalDetailResponse> findDetail(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.findDetail(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar meta")
    public ResponseEntity<GoalResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGoalRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir meta")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        goalService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Arquivar meta")
    public ResponseEntity<GoalResponse> archive(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.archive(userId, id));
    }

    // ==================== Movimentações ====================

    @PostMapping("/{id}/movements")
    @Operation(summary = "Registrar depósito ou retirada")
    public ResponseEntity<GoalDetailResponse> addMovement(
            @PathVariable Long id,
            @Valid @RequestBody CreateGoalMovementRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(goalService.addMovement(userId, id, request));
    }

    @DeleteMapping("/{id}/movements/{movementId}")
    @Operation(summary = "Remover movimentação")
    public ResponseEntity<Void> deleteMovement(
            @PathVariable Long id,
            @PathVariable Long movementId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        goalService.deleteMovement(userId, id, movementId);
        return ResponseEntity.noContent().build();
    }

    // ==================== Calendário de depósitos ====================

    @PostMapping("/{id}/deposit-plan")
    @Operation(summary = "Gerar ou recalcular calendário de depósitos")
    public ResponseEntity<List<GoalDepositPlanResponse>> generateDepositPlan(
            @PathVariable Long id,
            @Valid @RequestBody GenerateDepositPlanRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        boolean redistribute = Boolean.TRUE.equals(request.getRedistributeRemaining());
        return ResponseEntity.ok(
                goalService.generateDepositPlan(userId, id, request.getStrategy(), redistribute));
    }

    @PatchMapping("/{id}/deposit-plan")
    @Operation(summary = "Marcar/desmarcar depósito do calendário como realizado")
    public ResponseEntity<List<GoalDepositPlanResponse>> updateDepositPlan(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepositPlanRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.updateDepositPlan(userId, id, request));
    }

    // ==================== Quadradinhos (slots) ====================

    @PostMapping("/{id}/slot-plan")
    @Operation(summary = "Gerar ou recalcular os quadradinhos da meta",
            description = "Divide a meta em N quadradinhos distribuindo o valor conforme a estratégia")
    public ResponseEntity<List<GoalSlotPlanResponse>> generateSlotPlan(
            @PathVariable Long id,
            @Valid @RequestBody GenerateSlotPlanRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.generateSlotPlan(userId, id, request));
    }

    @PatchMapping("/{id}/slot-plan")
    @Operation(summary = "Preencher ou limpar um quadradinho da meta")
    public ResponseEntity<List<GoalSlotPlanResponse>> updateSlot(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSlotRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(goalService.updateSlot(userId, id, request));
    }

    // ==================== Calculadora de investimentos ====================

    @PostMapping("/calculator")
    @Operation(summary = "Calculadora de investimentos",
            description = "Simula a evolução do patrimônio com juros compostos e aportes mensais")
    public ResponseEntity<InvestmentSimulationResponse> simulate(
            @Valid @RequestBody InvestmentSimulationRequest request) {
        return ResponseEntity.ok(investmentCalculator.simulate(request));
    }
}
