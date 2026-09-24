package com.projeto.vault.controller;

import com.projeto.vault.dto.request.CreateCategoryRequest;
import com.projeto.vault.dto.request.UpdateCategoryRequest;
import com.projeto.vault.dto.response.CategoryResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller das categorias.
 */
@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categorias", description = "Gerenciamento de categorias de receitas e despesas")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    @Operation(summary = "Criar categoria")
    public ResponseEntity<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(userId, request));
    }

    @GetMapping
    @Operation(summary = "Listar categorias do usuário")
    public ResponseEntity<List<CategoryResponse>> findAll() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(categoryService.findAll(userId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar categoria por id")
    public ResponseEntity<CategoryResponse> findById(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(categoryService.findById(userId, id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar categoria")
    public ResponseEntity<CategoryResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateCategoryRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(categoryService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir categoria")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        categoryService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
