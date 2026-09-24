package com.projeto.vault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principal do Vault - Sistema de Gerenciamento Financeiro.
 *
 * <p>Responsável por iniciar a aplicação Spring Boot e toda a
 * inicialização automática dos módulos (Web, JPA, Security, etc.).</p>
 */
@SpringBootApplication
public class VaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(VaultApplication.class, args);
    }
}
