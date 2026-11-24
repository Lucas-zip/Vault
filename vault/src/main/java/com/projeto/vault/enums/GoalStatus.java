package com.projeto.vault.enums;

/**
 * Status de uma meta financeira.
 *
 * <ul>
 *   <li>ACTIVE - meta em andamento</li>
 *   <li>COMPLETED - meta atingida (valor acumulado >= valor desejado)</li>
 *   <li>ARCHIVED - meta arquivada pelo usuário</li>
 * </ul>
 */
public enum GoalStatus {
    ACTIVE,
    COMPLETED,
    ARCHIVED
}
