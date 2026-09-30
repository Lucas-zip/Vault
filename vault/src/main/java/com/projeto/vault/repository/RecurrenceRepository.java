package com.projeto.vault.repository;

import com.projeto.vault.entity.Recurrence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link Recurrence}.
 */
@Repository
public interface RecurrenceRepository extends JpaRepository<Recurrence, Long> {

    Optional<Recurrence> findByIdAndUserId(Long id, Long userId);

    /**
     * Carrega a recorrência aplicando lock pessimista de escrita.
     *
     * <p>Usado na execução para serializar execuções concorrentes da mesma
     * recorrência (ex.: clique duplo, chamadas simultâneas), evitando que duas
     * execuções leiam o mesmo conjunto de datas pendentes e gerem duplicatas.</p>
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Recurrence r WHERE r.id = :id AND r.user.id = :userId")
    Optional<Recurrence> findByIdAndUserIdForUpdate(
            @Param("id") Long id,
            @Param("userId") Long userId);

    List<Recurrence> findAllByUserIdAndActiveTrue(Long userId);

    List<Recurrence> findAllByUserId(Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);
}
