package com.projeto.vault.exception;

/**
 * Exceção lançada quando uma regra de negócio é violada (HTTP 422).
 */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
