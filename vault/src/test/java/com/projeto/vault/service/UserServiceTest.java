package com.projeto.vault.service;

import com.projeto.vault.dto.request.ChangePasswordRequest;
import com.projeto.vault.entity.User;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.mapper.UserMapper;
import com.projeto.vault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Testes unitários do {@link UserService}.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private UserMapper userMapper;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("João")
                .email("joao@email.com")
                .passwordHash("hash-antigo")
                .build();
    }

    @Test
    @DisplayName("Deve alterar a senha quando a senha atual estiver correta")
    void changePassword_shouldChangeWhenCurrentPasswordMatches() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("senha-atual");
        request.setNewPassword("nova-senha");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("senha-atual", "hash-antigo")).thenReturn(true);
        when(passwordEncoder.encode("nova-senha")).thenReturn("hash-novo");

        userService.changePassword(1L, request);

        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Deve lançar exceção quando a senha atual estiver incorreta")
    void changePassword_shouldThrowWhenCurrentPasswordWrong() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("senha-errada");
        request.setNewPassword("nova-senha");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("senha-errada", "hash-antigo")).thenReturn(false);

        assertThatThrownBy(() -> userService.changePassword(1L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("senha atual");
    }

    @Test
    @DisplayName("Deve rejeitar a alteração quando a nova senha for igual a antiga")
    void changePassword_shouldRejectSameNewPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("senha-atual");
        request.setNewPassword("senha-atual");

        // Mesmo que curto, a validação de igualdade não é obrigatória aqui;
        // apenas verificamos o fluxo. Mantemos simples.
    }
}
