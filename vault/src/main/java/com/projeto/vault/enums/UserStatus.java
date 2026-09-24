package com.projeto.vault.enums;

/**
 * Status da conta do usuário.
 *
 * <ul>
 *   <li>ACTIVE - conta ativa, pode operar normalmente.</li>
 *   <li>INACTIVE - conta desativada (o usuário solicitou desativação).</li>
 * </ul>
 *
 * Um usuário com status INACTIVE não pode autenticar.
 */
public enum UserStatus {
    ACTIVE,
    INACTIVE
}
