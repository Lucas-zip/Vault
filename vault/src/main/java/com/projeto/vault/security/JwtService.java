package com.projeto.vault.security;

import com.projeto.vault.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Serviço responsável por gerar e validar tokens JWT.
 *
 * <p>O token carrega o id, e-mail e role do usuário como claims.
 * A chave secreta vem da configuração via variável de ambiente.</p>
 */
@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expiration;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration}") long expiration) {
        if (secret == null || secret.isBlank() || secret.length() < 32) {
            throw new IllegalStateException(
                    "A propriedade app.jwt.secret deve estar configurada e ter pelo menos 32 caracteres.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    /**
     * Gera um token JWT para o usuário.
     */
    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey)
                .compact();
    }

    /**
     * Extrai o e-mail (subject) do token JWT.
     */
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    /**
     * Extrai o userId do token JWT.
     */
    public Long extractUserId(String token) {
        Object value = extractClaims(token).get("userId");
        if (value instanceof Integer intVal) {
            return intVal.longValue();
        }
        return ((Number) value).longValue();
    }

    /**
     * Extrai o role do token JWT.
     */
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    /**
     * Valida se o token é assinado corretamente e não está expirado.
     */
    public boolean isValid(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
