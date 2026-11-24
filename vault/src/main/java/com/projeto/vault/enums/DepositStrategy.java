package com.projeto.vault.enums;

/**
 * Estratégia de distribuição dos depósitos no calendário (por dias)
 * ou nos quadradinhos (slots) de uma meta.
 *
 * <ul>
 *   <li>FIXED - mesmo valor todos os dias</li>
 *   <li>INCREASING - valores crescem progressivamente a cada dia</li>
 *   <li>CUSTOM - o usuário define manualmente cada valor</li>
 *   <li>RANDOM - valores distribuídos de forma aleatória (usado nos slots),
 *   sempre fechando o total da meta</li>
 * </ul>
 */
public enum DepositStrategy {
    FIXED,
    INCREASING,
    CUSTOM,
    RANDOM
}
