package com.projeto.vault.enums;

/**
 * Modalidade de acompanhamento de uma meta financeira.
 *
 * <ul>
 *   <li>TRADITIONAL - acompanhamento manual com depósitos e retiradas</li>
 *   <li>INVESTMENT_CALCULATOR - projeção com juros compostos e aportes</li>
 *   <li>DEPOSIT_CALENDAR - planejamento diário de depósitos até o prazo</li>
 * </ul>
 */
public enum GoalModality {
    TRADITIONAL,
    INVESTMENT_CALCULATOR,
    DEPOSIT_CALENDAR
}
