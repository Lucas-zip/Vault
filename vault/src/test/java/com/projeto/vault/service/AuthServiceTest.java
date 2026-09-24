 package com.projeto.vault.service;

import com.projeto.vault.dto.request.LoginRequest;
import com.projeto.vault.dto.request.RegisterRequest;
import com.projeto.vault.dto.response.LoginResponse;
import com.projeto.vault.dto.response.UserResponse;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.UserRole;
import com.projeto.vault.enums.UserStatus;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.UnauthorizedException;
import com.projeto.vault.mapper.UserMapper;
import com.projeto.vault.repository.UserRepository;
import com.projeto.vault.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Testes unitários do {@link AuthService}.
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .passwordHash("hash-encoded")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    void register_shouldCreateUserSuccessfully() {
        RegisterRequest request = new RegisterRequest();
        request.setName("João Silva");
        request.setEmail("joao@email.com");
        request.setPassword("123456");

        UserResponse expected = UserResponse.builder().id(1L).name("João Silva").build();

        when(userRepository.existsByEmail("joao@email.com")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("hash-encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(userMapper.toResponse(user)).thenReturn(expected);

        UserResponse result = authService.register(request);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("João Silva");
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setName("João Silva");
        request.setEmail("joao@email.com");
        request.setPassword("123456");

        when(userRepository.existsByEmail("joao@email.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("e-mail");
    }

    @Test
    void login_shouldReturnTokenWhenCredentialsAreValid() {
        LoginRequest request = new LoginRequest();
        request.setEmail("joao@email.com");
        request.setPassword("123456");

        when(userRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("123456", "hash-encoded")).thenReturn(true);
        when(jwtService.generateToken(user)).thenReturn("token-jwt");

        LoginResponse result = authService.login(request);

        assertThat(result).isNotNull();
        assertThat(result.getToken()).isEqualTo("token-jwt");
        assertThat(result.getTokenType()).isEqualTo("Bearer");
    }

    @Test
    void login_shouldThrowWhenPasswordIsWrong() {
        LoginRequest request = new LoginRequest();
        request.setEmail("joao@email.com");
        request.setPassword("senha-errada");

        when(userRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("senha-errada", "hash-encoded")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Credenciais");
    }

    @Test
    void login_shouldThrowWhenUserNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("nao@existe.com");
        request.setPassword("123456");

        when(userRepository.findByEmail("nao@existe.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void login_shouldThrowWhenUserInactive() {
        user.setStatus(UserStatus.INACTIVE);
        LoginRequest request = new LoginRequest();
        request.setEmail("joao@email.com");
        request.setPassword("123456");

        when(userRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("inativa");
    }
}
