package com.projeto.vault.security;

import com.projeto.vault.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilidade para extrair informações do usuário autenticado
 * a partir do Spring SecurityContext.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /**
     * Extrai o id do usuário autenticado.
     *
     * @throws UnauthorizedException se não houver usuário autenticado.
     */
    public static Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("Usuário não autenticado");
        }
        return principal.getId();
    }
}
