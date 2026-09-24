package com.projeto.vault.service;

import com.projeto.vault.dto.request.LoginRequest;
import com.projeto.vault.dto.request.RegisterRequest;
import com.projeto.vault.dto.response.LoginResponse;
import com.projeto.vault.dto.response.UserResponse;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.UserRole;
import com.projeto.vault.enums.UserStatus;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.exception.UnauthorizedException;
import com.projeto.vault.mapper.UserMapper;
import com.projeto.vault.repository.UserRepository;
import com.projeto.vault.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável por autenticação e cadastro de usuários.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    /**
     * Cadastra um novo usuário. Retorna os dados criados.
     */
    @Transactional
    public UserResponse register(RegisterRequest request) {
        // Validar se o e-mail já está em uso
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Já existe um usuário com este e-mail");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .cpfCnpj(request.getCpfCnpj())
                .phone(request.getPhone())
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    /**
     * Realiza o login e retorna o token JWT.
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Credenciais inválidas"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Conta inativa. Não é possível realizar login");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Credenciais inválidas");
        }

        String token = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Busca um usuário pelo id (usado pela autenticação).
     */
    @Transactional(readOnly = true)
    public User findActiveUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }
}
