package com.projeto.vault.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de request para cadastro de um novo usuário.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String name;

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Size(max = 160, message = "O e-mail deve ter no máximo 160 caracteres")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 6, max = 60, message = "A senha deve ter entre 6 e 60 caracteres")
    private String password;

    @Size(max = 20, message = "CPF/CNPJ deve ter no máximo 20 caracteres")
    private String cpfCnpj;

    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    private String phone;
}
