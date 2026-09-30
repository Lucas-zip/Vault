package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateRecurrenceRequest;
import com.projeto.vault.dto.request.UpdateRecurrenceRequest;
import com.projeto.vault.dto.response.RecurrenceResponse;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.entity.Account;
import com.projeto.vault.entity.Category;
import com.projeto.vault.entity.Recurrence;
import com.projeto.vault.entity.Transaction;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.RecurrenceFrequency;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.RecurrenceMapper;
import com.projeto.vault.mapper.TransactionMapper;
import com.projeto.vault.repository.AccountRepository;
import com.projeto.vault.repository.CategoryRepository;
import com.projeto.vault.repository.RecurrenceRepository;
import com.projeto.vault.repository.TransactionRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Serviço responsável pelas transações recorrentes.
 *
 * <p>Permite criar recorrências e executá-las, gerando transações
 * conforme a frequência (diária, semanal, mensal, anual).</p>
 */
@Service
public class RecurrenceService {

    private final RecurrenceRepository recurrenceRepository;
    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final RecurrenceMapper recurrenceMapper;
    private final TransactionMapper transactionMapper;
    private final BalanceService balanceService;

    public RecurrenceService(RecurrenceRepository recurrenceRepository,
                             AccountRepository accountRepository,
                             CategoryRepository categoryRepository,
                             TransactionRepository transactionRepository,
                             UserRepository userRepository,
                             RecurrenceMapper recurrenceMapper,
                             TransactionMapper transactionMapper,
                             BalanceService balanceService) {
        this.recurrenceRepository = recurrenceRepository;
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.recurrenceMapper = recurrenceMapper;
        this.transactionMapper = transactionMapper;
        this.balanceService = balanceService;
    }

    @Transactional
    public RecurrenceResponse create(Long userId, CreateRecurrenceRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        Account account = findOwnedAccount(userId, request.getAccountId());
        Category category = resolveCategory(userId, request.getCategoryId());

        // Validação: data final não pode ser anterior à data inicial
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("A data final não pode ser anterior à data inicial");
        }

        Recurrence recurrence = Recurrence.builder()
                .user(user)
                .account(account)
                .category(category)
                .description(request.getDescription())
                .amount(request.getAmount())
                .type(request.getType())
                .frequency(request.getFrequency())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(true)
                .build();

        Recurrence saved = recurrenceRepository.save(recurrence);
        return recurrenceMapper.toResponse(saved, 0L);
    }

    @Transactional(readOnly = true)
    public List<RecurrenceResponse> findAll(Long userId) {
        return recurrenceRepository.findAllByUserId(userId)
                .stream()
                .map(recurrence -> recurrenceMapper.toResponse(
                        recurrence,
                        transactionRepository.countByRecurrenceMarker(userId, recurrence.getId())))
                .toList();
    }

    /**
     * Executa a recorrência, gerando as transações pendentes até a data atual
     * (ou data final, se definida).
     *
     * <p>A execução é <strong>idempotente</strong>: datas que já foram geradas
     * por esta recorrência são ignoradas, evitando lançamentos duplicados quando
     * o usuário executa mais de uma vez (ex.: clique duplo).</p>
     */
    @Transactional
    public List<TransactionResponse> execute(Long userId, Long recurrenceId) {
        // Lock pessimista: serializa execuções concorrentes da mesma recorrência,
        // evitando duplicação por clique duplo / chamadas simultâneas.
        Recurrence recurrence = recurrenceRepository.findByIdAndUserIdForUpdate(recurrenceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recorrência não encontrada"));

        if (!Boolean.TRUE.equals(recurrence.getActive())) {
            throw new BusinessException("A recorrência está inativa");
        }

        List<TransactionResponse> results = new ArrayList<>();

        // Determina o fim do período de geração
        LocalDate endDate = recurrence.getEndDate() != null
                ? recurrence.getEndDate()
                : LocalDate.now();

        if (endDate.isBefore(recurrence.getStartDate())) {
            return results;
        }

        User user = recurrence.getUser();
        Account account = recurrence.getAccount();
        Category category = recurrence.getCategory();

        // Calcula as datas que caem na frequência entre início e fim
        List<LocalDate> dates = computeDates(recurrence.getFrequency(),
                recurrence.getStartDate(), endDate);

        // Datas já geradas anteriormente — não devem ser geradas de novo
        Set<LocalDate> alreadyGenerated = new HashSet<>(
                transactionRepository.findGeneratedDatesByRecurrenceMarker(userId, recurrenceId));

        for (LocalDate date : dates) {
            if (alreadyGenerated.contains(date)) {
                continue;
            }

            // Gera a transação
            Transaction transaction = Transaction.builder()
                    .user(user)
                    .account(account)
                    .category(category)
                    .description(recurrence.getDescription())
                    .amount(recurrence.getAmount())
                    .type(recurrence.getType())
                    .transactionDate(date)
                    .observation("Gerado por recorrência #" + recurrence.getId())
                    .build();

            Transaction saved = transactionRepository.save(transaction);
            balanceService.applyImpact(account, saved.getType(), saved.getAmount());
            results.add(transactionMapper.toResponse(saved));
        }

        return results;
    }

    @Transactional(readOnly = true)
    public RecurrenceResponse findById(Long userId, Long recurrenceId) {
        Recurrence recurrence = findOwnedRecurrence(userId, recurrenceId);
        return recurrenceMapper.toResponse(
                recurrence,
                transactionRepository.countByRecurrenceMarker(userId, recurrenceId));
    }

    @Transactional
    public RecurrenceResponse update(Long userId, Long recurrenceId, UpdateRecurrenceRequest request) {
        Recurrence recurrence = findOwnedRecurrence(userId, recurrenceId);
        Account account = findOwnedAccount(userId, request.getAccountId());
        Category category = resolveCategory(userId, request.getCategoryId());

        recurrence.setDescription(request.getDescription());
        recurrence.setAmount(request.getAmount());
        recurrence.setType(request.getType());
        recurrence.setFrequency(request.getFrequency());
        recurrence.setStartDate(request.getStartDate());
        recurrence.setEndDate(request.getEndDate());
        recurrence.setAccount(account);
        recurrence.setCategory(category);
        if (request.getActive() != null) {
            recurrence.setActive(request.getActive());
        }

        Recurrence saved = recurrenceRepository.save(recurrence);
        return recurrenceMapper.toResponse(
                saved,
                transactionRepository.countByRecurrenceMarker(userId, recurrenceId));
    }

    @Transactional
    public void delete(Long userId, Long recurrenceId) {
        Recurrence recurrence = findOwnedRecurrence(userId, recurrenceId);
        recurrenceRepository.delete(recurrence);
    }

    /**
     * Calcula as datas que caem na frequência dada entre início e fim.
     */
    private List<LocalDate> computeDates(RecurrenceFrequency frequency, LocalDate start, LocalDate end) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate current = start;

        while (!current.isAfter(end)) {
            dates.add(current);
            current = switch (frequency) {
                case DAILY -> current.plusDays(1);
                case WEEKLY -> current.plusWeeks(1);
                case MONTHLY -> current.plusMonths(1);
                case YEARLY -> current.plusYears(1);
            };
        }
        return dates;
    }

    private Recurrence findOwnedRecurrence(Long userId, Long recurrenceId) {
        return recurrenceRepository.findByIdAndUserId(recurrenceId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Recorrência não encontrada"));
    }

    private Account findOwnedAccount(Long userId, Long accountId) {
        return accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));
    }

    private Category resolveCategory(Long userId, Long categoryId) {
        if (categoryId == null) {
            return null;
        }
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }
}
