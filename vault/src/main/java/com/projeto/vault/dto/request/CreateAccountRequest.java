package com.projeto.vault.dto.request;

import com.projeto.vault.enums.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * DTO de request para criação de uma conta financeira.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAccountRequest {

    @NotBlank(message = "O nome da conta é obrigatório")
    @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
    private String name;

    @NotNull(message = "O tipo da conta é obrigatório")
    private AccountType type;

    @NotNull(message = "O saldo inicial é obrigatório")
    private BigDecimal initialBalance;

    @Size(max = 120, message = "Instituição deve ter no máximo 120 caracteres")
    private String institution;

    @Size(max = 255, message = "Descrição deve ter no máximo 255 caracteres")
    private String description;
}
