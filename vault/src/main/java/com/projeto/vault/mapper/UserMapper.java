package com.projeto.vault.mapper;

import com.projeto.vault.dto.response.UserResponse;
import com.projeto.vault.entity.User;
import org.springframework.stereotype.Component;

/**
 * Mapper de conversão entre {@link User} e seus DTOs.
 */
@Component
public class UserMapper {

    /**
     * Converte a entidade User em UserResponse.
     * Nunca expõe a senha (passwordHash).
     */
    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .cpfCnpj(user.getCpfCnpj())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
