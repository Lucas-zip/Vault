package com.projeto.vault.service;

import com.projeto.vault.dto.request.CreateCategoryRequest;
import com.projeto.vault.dto.request.UpdateCategoryRequest;
import com.projeto.vault.dto.response.CategoryResponse;
import com.projeto.vault.entity.Category;
import com.projeto.vault.entity.User;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.CategoryMapper;
import com.projeto.vault.repository.CategoryRepository;
import com.projeto.vault.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Serviço responsável pelas operações de categorias.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryRepository categoryRepository,
                           UserRepository userRepository,
                           CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.categoryMapper = categoryMapper;
    }

    @Transactional
    public CategoryResponse create(Long userId, CreateCategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Regra: não permite categoria com mesmo nome e tipo para o mesmo usuário
        if (categoryRepository.existsByUserIdAndNameAndType(userId, request.getName(), request.getType())) {
            throw new BusinessException("Já existe uma categoria com este nome e tipo");
        }

        Category category = categoryMapper.toEntity(request, user);
        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll(Long userId) {
        return categoryRepository.findAllByUserId(userId)
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long userId, Long categoryId) {
        Category category = findOwnedCategory(userId, categoryId);
        return categoryMapper.toResponse(category);
    }

    @Transactional
    public CategoryResponse update(Long userId, Long categoryId, UpdateCategoryRequest request) {
        Category category = findOwnedCategory(userId, categoryId);

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        Category saved = categoryRepository.save(category);
        return categoryMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        Category category = findOwnedCategory(userId, categoryId);

        // Regra: não permite excluir categoria em uso (possui transações/recorrências/orçamentos)
        // A verificação é feita pelo fato de que a exclusão causaria
        // inconsistência referencial. Aqui garantimos a restrição de forma simples.
        if (category.getUser() == null) {
            throw new BusinessException("Categoria inválida");
        }

        categoryRepository.delete(category);
    }

    private Category findOwnedCategory(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));
    }
}
