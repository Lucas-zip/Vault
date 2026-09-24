package com.projeto.vault.mapper;

import com.projeto.vault.dto.request.CreateCategoryRequest;
import com.projeto.vault.dto.response.CategoryResponse;
import com.projeto.vault.entity.Category;
import com.projeto.vault.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper de conversão entre {@link Category} e seus DTOs.
 */
@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType() != null ? category.getType().name() : null)
                .description(category.getDescription())
                .build();
    }

    public Category toEntity(CreateCategoryRequest request, User user) {
        if (request == null) {
            return null;
        }
        Category category = new Category();
        category.setUser(user);
        category.setName(request.getName());
        category.setType(request.getType());
        category.setDescription(request.getDescription());
        return category;
    }
}
