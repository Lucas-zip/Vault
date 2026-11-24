import com.projeto.vault.entity.GoalSlotPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link GoalSlotPlan}.
 */
@Repository
public interface GoalSlotPlanRepository extends JpaRepository<GoalSlotPlan, Long> {

    List<GoalSlotPlan> findAllByGoalIdOrderBySlotIndexAsc(Long goalId);

    Optional<GoalSlotPlan> findByGoalIdAndSlotIndex(Long goalId, Integer slotIndex);

    /**
     * Remove em massa todos os slots de uma meta. Executado como DML direto
     * para garantir que o DELETE chegue ao banco antes de novos INSERTs
     * (evita violação da chave única goal_id + slot_index).
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from GoalSlotPlan p where p.goal.id = :goalId")
    void deleteAllByGoalId(@Param("goalId") Long goalId);
}
