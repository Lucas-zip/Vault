package com.projeto.vault.dto.request;

import com.projeto.vault.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de request para criação de uma categoria.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryRequest {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String name;

    @NotNull(message = "O tipo é obrigatório (INCOME ou EXPENSE)")
    private CategoryType type;

    @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
    private String description;
}
