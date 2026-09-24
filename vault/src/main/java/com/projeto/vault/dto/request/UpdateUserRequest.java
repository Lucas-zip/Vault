package com.projeto.vault.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de request para atualizar o perfil do usuário autenticado.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String name;

    @Size(max = 20, message = "CPF/CNPJ deve ter no máximo 20 caracteres")
    private String cpfCnpj;

    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    private String phone;
}
