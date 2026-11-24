package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateGoalMovementRequest;
import com.projeto.vault.dto.request.CreateGoalRequest;
import com.projeto.vault.dto.request.GenerateSlotPlanRequest;
import com.projeto.vault.dto.request.UpdateDepositPlanRequest;
import com.projeto.vault.dto.request.UpdateGoalRequest;
import com.projeto.vault.dto.request.UpdateSlotRequest;
import com.projeto.vault.dto.response.*;
import com.projeto.vault.entity.GoalDepositPlan;
import com.projeto.vault.entity.GoalMovement;
import com.projeto.vault.entity.GoalSlotPlan;
import com.projeto.vault.entity.SavingsGoal;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.DepositStrategy;
import com.projeto.vault.enums.GoalModality;
import com.projeto.vault.enums.GoalMovementType;
import com.projeto.vault.enums.GoalStatus;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.GoalMapper;
import com.projeto.vault.repository.GoalDepositPlanRepository;
import com.projeto.vault.repository.GoalMovementRepository;
import com.projeto.vault.repository.GoalSlotPlanRepository;
import com.projeto.vault.repository.SavingsGoalRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Serviço responsável pelas metas financeiras (caixinhas).
 *
 * <p>Centraliza as regras de negócio: criação/edição de metas, depósitos e
 * retiradas (mantendo o saldo acumulado em sincronia), atualização de status
 * (concluída quando atinge o alvo) e geração do calendário de depósitos.</p>
 */
@Service
public class SavingsGoalService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final int MAX_CALENDAR_DAYS = 3660; // ~10 anos

    private final SavingsGoalRepository goalRepository;
    private final GoalMovementRepository movementRepository;
    private final GoalDepositPlanRepository depositPlanRepository;
    private final GoalSlotPlanRepository slotPlanRepository;
    private final UserRepository userRepository;
    private final GoalMapper goalMapper;

    public SavingsGoalService(SavingsGoalRepository goalRepository,
                              GoalMovementRepository movementRepository,
                              GoalDepositPlanRepository depositPlanRepository,
                              GoalSlotPlanRepository slotPlanRepository,
                              UserRepository userRepository,
                              GoalMapper goalMapper) {
        this.goalRepository = goalRepository;
        this.movementRepository = movementRepository;
        this.depositPlanRepository = depositPlanRepository;
        this.slotPlanRepository = slotPlanRepository;
        this.userRepository = userRepository;
        this.goalMapper = goalMapper;
    }

    // ==================== CRUD da meta ====================

    @Transactional
    public GoalResponse create(Long userId, CreateGoalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        validateDates(request.getStartDate(), request.getTargetDate());

        BigDecimal initial = request.getInitialAmount() != null
                ? request.getInitialAmount() : BigDecimal.ZERO;
        if (initial.compareTo(request.getTargetAmount()) > 0) {
            throw new BusinessException("O valor inicial não pode ser maior que o valor desejado");
        }

        SavingsGoal goal = SavingsGoal.builder()
                .user(user)
                .name(request.getName().trim())
                .description(trimToNull(request.getDescription()))
                .targetAmount(request.getTargetAmount())
                .initialAmount(initial)
                .currentAmount(initial)
                .startDate(request.getStartDate())
                .targetDate(request.getTargetDate())
                .modality(request.getModality())
                .depositStrategy(request.getDepositStrategy())
                .color(trimToNull(request.getColor()))
                .status(initial.compareTo(request.getTargetAmount()) >= 0
                        ? GoalStatus.COMPLETED : GoalStatus.ACTIVE)
                .build();

        SavingsGoal saved = goalRepository.save(goal);
        return goalMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<GoalResponse> findAll(Long userId, GoalStatus status) {
        List<SavingsGoal> goals = status != null
                ? goalRepository.findAllByUserIdAndStatus(userId, status)
                : goalRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        return goals.stream().map(goalMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public GoalDetailResponse findDetail(Long userId, Long goalId) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);
        List<GoalMovementResponse> movements = movementRepository
                .findAllByGoalIdOrderByMovementDateDescIdDesc(goalId)
                .stream().map(goalMapper::toResponse).toList();

        List<GoalDepositPlanResponse> plan = depositPlanRepository
                .findAllByGoalIdOrderByDepositDateAsc(goalId)
                .stream().map(goalMapper::toResponse).toList();

        List<GoalSlotPlanResponse> slotPlan = slotPlanRepository
                .findAllByGoalIdOrderBySlotIndexAsc(goalId)
                .stream().map(goalMapper::toResponse).toList();

        return GoalDetailResponse.builder()
                .goal(goalMapper.toResponse(goal))
                .movements(movements)
                .depositPlan(plan)
                .slotPlan(slotPlan)
                .build();
    }

    @Transactional
    public GoalResponse update(Long userId, Long goalId, UpdateGoalRequest request) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);

        validateDates(request.getStartDate(), request.getTargetDate());

        if (goal.getCurrentAmount().compareTo(request.getTargetAmount()) > 0) {
            // Ajuste permitido: se o valor desejado ficar abaixo do acumulado,
            // a meta passa a constar como concluída (não impede a edição).
        }

        goal.setName(request.getName().trim());
        goal.setDescription(trimToNull(request.getDescription()));
        goal.setTargetAmount(request.getTargetAmount());
        goal.setStartDate(request.getStartDate());
        goal.setTargetDate(request.getTargetDate());
        goal.setModality(request.getModality());
        goal.setDepositStrategy(request.getDepositStrategy());
        goal.setColor(trimToNull(request.getColor()));

        refreshStatus(goal);

        SavingsGoal saved = goalRepository.save(goal);
        return goalMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long userId, Long goalId) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);
        goalRepository.delete(goal);
    }

    @Transactional
    public GoalResponse archive(Long userId, Long goalId) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);
        goal.setStatus(GoalStatus.ARCHIVED);
        return goalMapper.toResponse(goalRepository.save(goal));
    }

    // ==================== Movimentações ====================

    @Transactional
    public GoalDetailResponse addMovement(Long userId, Long goalId, CreateGoalMovementRequest request) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);

        if (goal.getStatus() == GoalStatus.ARCHIVED) {
            throw new BusinessException("Não é possível movimentar uma meta arquivada");
        }

        BigDecimal amount = request.getAmount();
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("O valor deve ser maior que zero");
        }

        if (request.getType() == GoalMovementType.WITHDRAWAL) {
            if (amount.compareTo(goal.getCurrentAmount()) > 0) {
                throw new BusinessException("A retirada não pode ultrapassar o saldo acumulado");
            }
            goal.setCurrentAmount(goal.getCurrentAmount().subtract(amount));
        } else {
            goal.setCurrentAmount(goal.getCurrentAmount().add(amount));
        }

        GoalMovement movement = GoalMovement.builder()
                .goal(goal)
                .type(request.getType())
                .amount(amount)
                .movementDate(request.getMovementDate())
                .description(trimToNull(request.getDescription()))
                .build();
        movementRepository.save(movement);

        refreshStatus(goal);
        goalRepository.save(goal);

        return findDetail(userId, goalId);
    }

    @Transactional
    public void deleteMovement(Long userId, Long goalId, Long movementId) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);
        GoalMovement movement = movementRepository.findById(movementId)
                .orElseThrow(() -> new ResourceNotFoundException("Movimentação não encontrada"));

        if (!movement.getGoal().getId().equals(goalId)) {
            throw new ResourceNotFoundException("Movimentação não encontrada");
        }

        // Reverte o efeito da movimentação no saldo acumulado.
        if (movement.getType() == GoalMovementType.WITHDRAWAL) {
            goal.setCurrentAmount(goal.getCurrentAmount().add(movement.getAmount()));
        } else {
            BigDecimal newBalance = goal.getCurrentAmount().subtract(movement.getAmount());
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException(
                        "Não é possível remover o depósito: o saldo ficaria negativo");
            }
            goal.setCurrentAmount(newBalance);
        }

        movementRepository.delete(movement);
        refreshStatus(goal);
        goalRepository.save(goal);
    }

    // ==================== Resumo (dashboard) ====================

    @Transactional(readOnly = true)
    public GoalSummaryResponse summary(Long userId) {
        List<SavingsGoal> goals = goalRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        long active = 0, completed = 0, archived = 0;
        BigDecimal totalSaved = BigDecimal.ZERO;
        BigDecimal totalTargetActive = BigDecimal.ZERO;

        for (SavingsGoal goal : goals) {
            switch (goal.getStatus()) {
                case ACTIVE -> {
                    active++;
                    totalTargetActive = totalTargetActive.add(goal.getTargetAmount());
                    totalSaved = totalSaved.add(goal.getCurrentAmount());
                }
                case COMPLETED -> {
                    completed++;
                    totalSaved = totalSaved.add(goal.getCurrentAmount());
                }
                case ARCHIVED -> archived++;
            }
        }

        return GoalSummaryResponse.builder()
                .activeCount(active)
                .completedCount(completed)
                .archivedCount(archived)
                .totalSaved(totalSaved)
                .totalTargetActive(totalTargetActive)
                .build();
    }

    // ==================== Calendário de depósitos ====================

    /**
     * (Re)gera o planejamento diário de depósitos de uma meta.
     *
     * <p>Distribui o valor que falta para atingir o objetivo entre os dias
     * disponíveis (de hoje — ou da data de início, se futura — até a data
     * limite). Quando {@code redistributeRemaining} é verdadeiro, preserva
     * os depósitos já realizados e redistribui apenas o restante.</p>
     */
    @Transactional
    public List<GoalDepositPlanResponse> generateDepositPlan(Long userId, Long goalId,
                                                             DepositStrategy strategy,
                                                             boolean redistributeRemaining) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);

        if (goal.getTargetDate() == null) {
            throw new BusinessException("A meta precisa de uma data limite para gerar o calendário");
        }

        LocalDate today = LocalDate.now();
        LocalDate start = goal.getStartDate().isAfter(today) ? goal.getStartDate() : today;
        LocalDate end = goal.getTargetDate();

        if (end.isBefore(start)) {
            throw new BusinessException("A data limite já passou; ajuste o prazo da meta");
        }

        long totalDays = ChronoUnit.DAYS.between(start, end) + 1;
        if (totalDays > MAX_CALENDAR_DAYS) {
            throw new BusinessException(
                    "O prazo é muito longo para planejamento diário (máximo de ~10 anos)");
        }

        // Valor que ainda falta considerar no planejamento.
        BigDecimal alreadySaved = goal.getCurrentAmount();
        BigDecimal remaining = goal.getTargetAmount().subtract(alreadySaved);
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        // Preserva dias já concluídos (quando redistribuindo).
        List<GoalDepositPlan> existing = depositPlanRepository
                .findAllByGoalIdOrderByDepositDateAsc(goalId);

        if (redistributeRemaining) {
            for (GoalDepositPlan plan : existing) {
                if (Boolean.TRUE.equals(plan.getDone())) {
                    BigDecimal actual = plan.getActualAmount() != null
                            ? plan.getActualAmount() : plan.getPlannedAmount();
                    remaining = remaining.subtract(actual);
                }
            }
        }
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        // Remove os itens antigos (inclusive os já feitos, quando não redistribuindo).
        depositPlanRepository.deleteAllByGoalId(goalId);
        depositPlanRepository.flush();

        List<GoalDepositPlan> plans = buildPlans(goal, start, end, remaining, strategy);

        // Reinsere os dias já concluídos que devem ser preservados.
        if (redistributeRemaining) {
            for (GoalDepositPlan plan : existing) {
                if (Boolean.TRUE.equals(plan.getDone())) {
                    plan.setId(null);
                    plan.setGoal(goal);
                    plans.add(plan);
                }
            }
        }

        List<GoalDepositPlan> saved = depositPlanRepository.saveAll(plans);
        saved.sort((a, b) -> a.getDepositDate().compareTo(b.getDepositDate()));

        goal.setDepositStrategy(strategy);
        goalRepository.save(goal);

        return saved.stream().map(goalMapper::toResponse).toList();
    }

    /**
     * Gera os itens do calendário para o período, distribuindo {@code remaining}.
     */
    private List<GoalDepositPlan> buildPlans(SavingsGoal goal, LocalDate start, LocalDate end,
                                             BigDecimal remaining, DepositStrategy strategy) {
        List<GoalDepositPlan> plans = new ArrayList<>();

        long totalDays = ChronoUnit.DAYS.between(start, end) + 1;
        if (totalDays <= 0 || remaining.compareTo(BigDecimal.ZERO) <= 0) {
            // Nada a distribuir: gera dias com valor zero para exibir o período.
            for (long i = 0; i < Math.max(totalDays, 0); i++) {
                plans.add(newPlan(goal, start.plusDays(i), BigDecimal.ZERO));
            }
            return plans;
        }

        BigDecimal[] amounts = switch (strategy) {
            case FIXED -> distributeFixed(remaining, (int) totalDays);
            case INCREASING -> distributeIncreasing(remaining, (int) totalDays);
            case CUSTOM -> distributeFixed(remaining, (int) totalDays); // base inicial
            case RANDOM -> distributeRandom(remaining, (int) totalDays);
        };

        for (int i = 0; i < totalDays; i++) {
            plans.add(newPlan(goal, start.plusDays(i), amounts[i]));
        }
        return plans;
    }

    /** Distribui igualmente, ajustando a diferença de centavos no último dia. */
    private BigDecimal[] distributeFixed(BigDecimal total, int days) {
        BigDecimal[] result = new BigDecimal[days];
        BigDecimal perDay = total.divide(BigDecimal.valueOf(days), 2, RoundingMode.DOWN);
        BigDecimal distributed = perDay.multiply(BigDecimal.valueOf(days));
        BigDecimal diff = total.subtract(distributed);

        for (int i = 0; i < days; i++) {
            // O primeiro dia absorve a diferença de arredondamento.
            result[i] = i == 0 ? perDay.add(diff) : perDay;
        }
        return result;
    }

    /**
     * Distribui com valores crescentes (progressão aritmética 1,2,3,...,n).
     * Resolve o fator base {@code a} tal que a * (1+2+...+n) = total.
     */
    private BigDecimal[] distributeIncreasing(BigDecimal total, int days) {
        BigDecimal[] result = new BigDecimal[days];
        long sumWeights = (long) days * (days + 1) / 2;
        BigDecimal unit = total.divide(BigDecimal.valueOf(sumWeights), 8, RoundingMode.DOWN);

        BigDecimal distributed = BigDecimal.ZERO;
        for (int i = 0; i < days; i++) {
            BigDecimal value = unit.multiply(BigDecimal.valueOf(i + 1))
                    .setScale(2, RoundingMode.DOWN);
            result[i] = value;
            distributed = distributed.add(value);
        }
        // Ajusta a diferença no último dia para fechar exatamente o total.
        BigDecimal diff = total.subtract(distributed);
        result[days - 1] = result[days - 1].add(diff);
        return result;
    }

    private GoalDepositPlan newPlan(SavingsGoal goal, LocalDate date, BigDecimal amount) {
        return GoalDepositPlan.builder()
                .goal(goal)
                .depositDate(date)
                .plannedAmount(amount)
                .done(false)
                .build();
    }

    /**
     * Marca/desmarca um dia como realizado, registrando o valor efetivo.
     *
     * <p>Se o dia for marcado como realizado, cria automaticamente um depósito
     * no histórico da meta (valor efetivo ou planejado). Desmarcar remove esse
     * depósito correspondente, quando existir na mesma data.</p>
     */
    @Transactional
    public List<GoalDepositPlanResponse> updateDepositPlan(Long userId, Long goalId,
                                                           UpdateDepositPlanRequest request) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);

        GoalDepositPlan plan = depositPlanRepository
                .findByGoalIdAndDepositDate(goalId, request.getDepositDate())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não há depósito planejado para a data informada"));

        boolean wasDone = Boolean.TRUE.equals(plan.getDone());
        boolean done = Boolean.TRUE.equals(request.getDone());

        if (done && !wasDone) {
            BigDecimal actual = request.getActualAmount() != null
                    ? request.getActualAmount() : plan.getPlannedAmount();
            if (actual.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("O valor depositado deve ser maior que zero");
            }

            plan.setDone(true);
            plan.setActualAmount(actual);

            goal.setCurrentAmount(goal.getCurrentAmount().add(actual));
            movementRepository.save(GoalMovement.builder()
                    .goal(goal)
                    .type(GoalMovementType.DEPOSIT)
                    .amount(actual)
                    .movementDate(plan.getDepositDate())
                    .description("Depósito do calendário")
                    .build());
            refreshStatus(goal);
            goalRepository.save(goal);
        } else if (!done && wasDone) {
            BigDecimal actual = plan.getActualAmount() != null
                    ? plan.getActualAmount() : plan.getPlannedAmount();

            BigDecimal newBalance = goal.getCurrentAmount().subtract(actual);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException(
                        "Não é possível desmarcar: o saldo da meta ficaria negativo");
            }
            goal.setCurrentAmount(newBalance);
            plan.setDone(false);
            plan.setActualAmount(null);

            // Remove o depósito correspondente gerado pelo calendário.
            movementRepository.findAllByGoalIdOrderByMovementDateDescIdDesc(goalId).stream()
                    .filter(m -> m.getType() == GoalMovementType.DEPOSIT
                            && m.getMovementDate().equals(plan.getDepositDate())
                            && m.getAmount().compareTo(actual) == 0)
                    .findFirst()
                    .ifPresent(movementRepository::delete);

            refreshStatus(goal);
            goalRepository.save(goal);
        } else if (done) {
            // Já estava concluído: permite corrigir o valor efetivo.
            BigDecimal previous = plan.getActualAmount() != null
                    ? plan.getActualAmount() : plan.getPlannedAmount();
            BigDecimal actual = request.getActualAmount() != null
                    ? request.getActualAmount() : plan.getPlannedAmount();
            if (actual.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("O valor depositado deve ser maior que zero");
            }
            BigDecimal delta = actual.subtract(previous);
            BigDecimal newBalance = goal.getCurrentAmount().add(delta);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException("O valor informado deixa o saldo negativo");
            }
            goal.setCurrentAmount(newBalance);
            plan.setActualAmount(actual);
            refreshStatus(goal);
            goalRepository.save(goal);
        }

        depositPlanRepository.save(plan);

        return depositPlanRepository.findAllByGoalIdOrderByDepositDateAsc(goalId)
                .stream().map(goalMapper::toResponse).toList();
    }

    // ==================== Quadradinhos (slots) ====================

    /**
     * (Re)gera os quadradinhos de uma meta.
     *
     * <p>Divide o valor que falta para atingir o objetivo em {@code slotCount}
     * quadradinhos. A distribuição planejada segue a estratégia escolhida
     * (fixo, crescente ou aleatório), sempre fechando exatamente o total.
     * Ao redistribuir, os slots já preenchidos são preservados e apenas o
     * restante é redistribuído.</p>
     */
    @Transactional
    public List<GoalSlotPlanResponse> generateSlotPlan(Long userId, Long goalId,
                                                       GenerateSlotPlanRequest request) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);

        int slotCount = request.getSlotCount();
        if (slotCount < 1) {
            throw new BusinessException("Informe ao menos 1 quadradinho");
        }
        if (slotCount > 500) {
            throw new BusinessException("O número máximo de quadradinhos é 500");
        }

        DepositStrategy strategy = request.getStrategy() != null
                ? request.getStrategy() : DepositStrategy.FIXED;

        // Valor que ainda falta para atingir a meta. Como os slots já preenchidos
        // registram depósitos que entram em {@code currentAmount}, este valor já
        // corresponde ao que falta distribuir entre os slots pendentes.
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        if (remaining.compareTo(BigDecimal.ZERO) < 0) {
            remaining = BigDecimal.ZERO;
        }

        // Snapshot dos slots já preenchidos (para preservá-los na recriação).
        record DoneSnapshot(BigDecimal actualAmount) {}
        List<DoneSnapshot> doneSnapshots = slotPlanRepository
                .findAllByGoalIdOrderBySlotIndexAsc(goalId).stream()
                .filter(s -> Boolean.TRUE.equals(s.getDone()))
                .map(s -> new DoneSnapshot(
                        s.getActualAmount() != null ? s.getActualAmount() : s.getPlannedAmount()))
                .toList();

        int remainingSlots = slotCount - doneSnapshots.size();
        if (remainingSlots < 0) {
            throw new BusinessException(
                    "A meta já possui mais quadradinhos preenchidos do que o total informado");
        }

        // Remove todos os slots antigos (DML direto + flush/clear).
        slotPlanRepository.deleteAllByGoalId(goalId);

        // Recria os slots do zero, evitando reutilizar entidades desanexadas.
        List<GoalSlotPlan> plans = new ArrayList<>();
        int index = 0;

        // Preserva os slots concluídos (que já contribuem para o saldo atual).
        for (DoneSnapshot snap : doneSnapshots) {
            plans.add(GoalSlotPlan.builder()
                    .goal(goal)
                    .slotIndex(index++)
                    .plannedAmount(snap.actualAmount())
                    .done(true)
                    .actualAmount(snap.actualAmount())
                    .build());
        }

        // Distribui o restante entre os slots pendentes.
        BigDecimal[] amounts = distributeSlots(remaining, remainingSlots, strategy);
        for (int i = 0; i < remainingSlots; i++) {
            plans.add(GoalSlotPlan.builder()
                    .goal(goal)
                    .slotIndex(index++)
                    .plannedAmount(amounts[i])
                    .done(false)
                    .build());
        }

        List<GoalSlotPlan> saved = slotPlanRepository.saveAll(plans);
        saved.sort((a, b) -> a.getSlotIndex().compareTo(b.getSlotIndex()));

        goal.setDepositStrategy(strategy);
        goalRepository.save(goal);

        return saved.stream().map(goalMapper::toResponse).toList();
    }

    /**
     * Preenche ou limpa um quadradinho, atualizando o saldo acumulado da meta.
     *
     * <p>Ao preencher, registra um depósito no histórico. Ao limpar, remove
     * o depósito correspondente (se houver) e devolve o valor ao saldo.</p>
     */
    @Transactional
    public List<GoalSlotPlanResponse> updateSlot(Long userId, Long goalId,
                                                 UpdateSlotRequest request) {
        SavingsGoal goal = findOwnedGoal(userId, goalId);

        if (goal.getStatus() == GoalStatus.ARCHIVED) {
            throw new BusinessException("Não é possível movimentar uma meta arquivada");
        }

        GoalSlotPlan slot = slotPlanRepository
                .findByGoalIdAndSlotIndex(goalId, request.getSlotIndex())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não há quadradinho com o índice informado"));

        boolean wasDone = Boolean.TRUE.equals(slot.getDone());
        boolean done = Boolean.TRUE.equals(request.getDone());

        if (done && !wasDone) {
            BigDecimal actual = request.getActualAmount() != null
                    ? request.getActualAmount() : slot.getPlannedAmount();
            if (actual.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("O valor depositado deve ser maior que zero");
            }

            slot.setDone(true);
            slot.setActualAmount(actual);
            goal.setCurrentAmount(goal.getCurrentAmount().add(actual));

            movementRepository.save(GoalMovement.builder()
                    .goal(goal)
                    .type(GoalMovementType.DEPOSIT)
                    .amount(actual)
                    .movementDate(LocalDate.now())
                    .description("Depósito do quadradinho #" + (slot.getSlotIndex() + 1))
                    .build());

            refreshStatus(goal);
            goalRepository.save(goal);
        } else if (!done && wasDone) {
            BigDecimal actual = slot.getActualAmount() != null
                    ? slot.getActualAmount() : slot.getPlannedAmount();

            BigDecimal newBalance = goal.getCurrentAmount().subtract(actual);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException(
                        "Não é possível limpar: o saldo da meta ficaria negativo");
            }
            goal.setCurrentAmount(newBalance);
            slot.setDone(false);
            slot.setActualAmount(null);

            final int slotIndex = slot.getSlotIndex();
            final BigDecimal actualValue = actual;
            movementRepository.findAllByGoalIdOrderByMovementDateDescIdDesc(goalId).stream()
                    .filter(m -> m.getType() == GoalMovementType.DEPOSIT
                            && m.getDescription() != null
                            && m.getDescription().equals(
                                    "Depósito do quadradinho #" + (slotIndex + 1))
                            && m.getAmount().compareTo(actualValue) == 0)
                    .findFirst()
                    .ifPresent(movementRepository::delete);

            refreshStatus(goal);
            goalRepository.save(goal);
        } else if (done) {
            // Já estava preenchido: permite corrigir o valor efetivo.
            BigDecimal previous = slot.getActualAmount() != null
                    ? slot.getActualAmount() : slot.getPlannedAmount();
            BigDecimal actual = request.getActualAmount() != null
                    ? request.getActualAmount() : slot.getPlannedAmount();
            if (actual.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("O valor depositado deve ser maior que zero");
            }
            BigDecimal delta = actual.subtract(previous);
            BigDecimal newBalance = goal.getCurrentAmount().add(delta);
            if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
                throw new BusinessException("O valor informado deixa o saldo negativo");
            }
            goal.setCurrentAmount(newBalance);
            slot.setActualAmount(actual);
            refreshStatus(goal);
            goalRepository.save(goal);
        }

        slotPlanRepository.save(slot);

        return slotPlanRepository.findAllByGoalIdOrderBySlotIndexAsc(goalId)
                .stream().map(goalMapper::toResponse).toList();
    }

    /**
     * Distribui {@code total} entre {@code slots} quadradinhos, fechando
     * exatamente o total ao final.
     */
    private BigDecimal[] distributeSlots(BigDecimal total, int slots, DepositStrategy strategy) {
        BigDecimal[] result = new BigDecimal[Math.max(slots, 0)];
        if (slots <= 0) {
            return result;
        }
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            for (int i = 0; i < slots; i++) {
                result[i] = BigDecimal.ZERO;
            }
            return result;
        }

        return switch (strategy) {
            case INCREASING -> distributeIncreasing(total, slots);
            case RANDOM -> distributeRandom(total, slots);
            // FIXED e CUSTOM usam base fixa (CUSTOM pode ser ajustado depois pelo usuário)
            default -> distributeFixed(total, slots);
        };
    }

    /**
     * Distribui o total de forma aleatória entre os slots, garantindo que a
     * soma feche exatamente o total. Cada slot recebe um peso aleatório.
     */
    private BigDecimal[] distributeRandom(BigDecimal total, int slots) {
        BigDecimal[] result = new BigDecimal[slots];
        Random random = new Random();

        // Pesos aleatórios (1..100) para cada slot.
        List<Integer> weights = new ArrayList<>();
        long sumWeights = 0;
        for (int i = 0; i < slots; i++) {
            int w = 1 + random.nextInt(100);
            weights.add(w);
            sumWeights += w;
        }

        BigDecimal totalCents = total.setScale(2, RoundingMode.DOWN);
        long totalCentsLong = totalCents.movePointRight(2).longValue();

        long distributedCents = 0;
        for (int i = 0; i < slots; i++) {
            long cents = (totalCentsLong * weights.get(i)) / sumWeights;
            distributedCents += cents;
            result[i] = BigDecimal.valueOf(cents).movePointLeft(2);
        }

        // Ajusta a diferença de centavos no último slot.
        long diff = totalCentsLong - distributedCents;
        result[slots - 1] = result[slots - 1]
                .add(BigDecimal.valueOf(diff).movePointLeft(2));

        return result;
    }

    // ==================== Helpers ====================

    private SavingsGoal findOwnedGoal(Long userId, Long goalId) {
        return goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Meta não encontrada"));
    }

    /** Atualiza o status entre ACTIVE e COMPLETED conforme o saldo acumulado. */
    private void refreshStatus(SavingsGoal goal) {
        if (goal.getStatus() == GoalStatus.ARCHIVED) {
            return;
        }
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(GoalStatus.COMPLETED);
        } else {
            goal.setStatus(GoalStatus.ACTIVE);
            // Se estava concluída e houve retirada, volta a ativa automaticamente.
        }
    }

    private void validateDates(LocalDate start, LocalDate target) {
        if (target != null && target.isBefore(start)) {
            throw new BusinessException("A data limite não pode ser anterior à data de início");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
