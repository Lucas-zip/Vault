package com.projeto.vault.enums;

/**
 * Status de contas a pagar e a receber ({@code FutureTransaction}).
 *
 * <ul>
 *   <li>PENDING - pendente (ainda não venceu, aguardando pagamento).</li>
 *   <li>PAID - pago/recebido.</li>
 *   <li>OVERDUE - vencido (não pago após o vencimento).</li>
 *   <li>CANCELLED - cancelado pelo usuário.</li>
 * </ul>
 */
public enum FutureStatus {
    PENDING,
    PAID,
    OVERDUE,
    CANCELLED
}
