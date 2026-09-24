package com.projeto.vault.repository;

import com.projeto.vault.entity.Recurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link Recurrence}.
 */
@Repository
public interface RecurrenceRepository extends JpaRepository<Recurrence, Long> {

    Optional<Recurrence> findByIdAndUserId(Long id, Long userId);

    List<Recurrence> findAllByUserIdAndActiveTrue(Long userId);

    List<Recurrence> findAllByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
