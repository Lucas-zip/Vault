package com.projeto.vault.enums;

/**
 * Tipo de movimentação financeira.
 *
 * <ul>
 *   <li>INCOME - receita (entrada de dinheiro), aumenta o saldo da conta.</li>
 *   <li>EXPENSE - despesa (saída de dinheiro), diminui o saldo da conta.</li>
 * </ul>
 */
public enum TransactionType {
    INCOME,
    EXPENSE
}
