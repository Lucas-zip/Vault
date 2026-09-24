package com.projeto.vault.dto.request;

import com.projeto.vault.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de request para atualização de uma conta financeira.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountRequest {

    @NotBlank(message = "O nome da conta é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String name;

    @NotNull(message = "O tipo da conta é obrigatório")
    private AccountType type;

    @Size(max = 120, message = "Instituição deve ter no máximo 120 caracteres")
    private String institution;

    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    private String description;
}
