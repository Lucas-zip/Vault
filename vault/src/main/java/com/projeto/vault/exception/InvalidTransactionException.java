package com.projeto.vault.exception;

/**
 * Exceção lançada quando uma transação financeira é inválida
 * (ex: valor negativo, saldo insuficiente) (HTTP 422).
 */
public class InvalidTransactionException extends RuntimeException {

    public InvalidTransactionException(String message) {
        super(message);
    }
}
