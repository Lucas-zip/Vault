package com.projeto.vault.repository;

import com.projeto.vault.entity.Category;
import com.projeto.vault.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório de acesso a dados para {@link Category}.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByIdAndUserId(Long id, Long userId);

    List<Category> findAllByUserId(Long userId);

    List<Category> findAllByUserIdAndType(Long userId, CategoryType type);

    boolean existsByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndNameAndType(Long userId, String name, CategoryType type);
}
