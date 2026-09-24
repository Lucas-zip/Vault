package com.projeto.vault.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO de request para alteração de senha.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {

    @NotBlank(message = "A senha atual é obrigatória")
    private String currentPassword;

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 6, max = 60, message = "A nova senha deve ter entre 6 e 60 caracteres")
    private String newPassword;
}
