package com.projeto.vault.repository;

import com.projeto.vault.entity.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link Account}.
 *
 * <p>Note que as consultas sempre levam o {@code userId} para garantir
 * o isolamento dos dados por usuário.</p>
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    /**
     * Busca uma conta pertencente a um usuário específico.
     * Retorna Optional vazio se a conta não pertence ao usuário.
     */
    Optional<Account> findByIdAndUserId(Long id, Long userId);

    /** Lista todas as contas de um usuário. */
    List<Account> findAllByUserId(Long userId);

    /** Paginação de contas de um usuário. */
    Page<Account> findAllByUserId(Long userId, Pageable pageable);

    boolean existsByIdAndUserId(Long id, Long userId);
}
