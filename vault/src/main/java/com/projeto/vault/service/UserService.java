package com.projeto.vault.service;

import com.projeto.vault.dto.request.ChangePasswordRequest;
import com.projeto.vault.dto.request.UpdateUserRequest;
import com.projeto.vault.dto.response.UserResponse;
import com.projeto.vault.entity.User;
import com.projeto.vault.enums.UserStatus;
import com.projeto.vault.exception.BusinessException;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.mapper.UserMapper;
import com.projeto.vault.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço responsável pelas operações do usuário autenticado.
 *
 * <p>Todas as operações usam o id do usuário vindos do contexto de
 * autenticação, garantindo isolamento dos dados.</p>
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    /**
     * Busca o perfil do usuário autenticado.
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = findUser(userId);
        return userMapper.toResponse(user);
    }

    /**
     * Atualiza os dados do usuário autenticado.
     */
    @Transactional
    public UserResponse updateProfile(Long userId, UpdateUserRequest request) {
        User user = findUser(userId);

        user.setName(request.getName());
        user.setCpfCnpj(request.getCpfCnpj());
        user.setPhone(request.getPhone());

        User saved = userRepository.save(user);
        return userMapper.toResponse(saved);
    }

    /**
     * Altera a senha do usuário autenticado.
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findUser(userId);

        // Valida a senha atual
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("A senha atual está incorreta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * Desativa a conta do usuário autenticado.
     */
    @Transactional
    public void deactivateAccount(Long userId) {
        User user = findUser(userId);
        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }
}
