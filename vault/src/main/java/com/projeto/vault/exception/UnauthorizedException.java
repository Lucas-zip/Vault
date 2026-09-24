package com.projeto.vault.exception;

/**
 * Exceção lançada quando um usuário não possui autorização
 * para acessar/modificar um recurso (HTTP 403).
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
