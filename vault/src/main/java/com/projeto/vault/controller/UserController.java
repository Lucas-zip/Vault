package com.projeto.vault.controller;

import com.projeto.vault.dto.request.ChangePasswordRequest;
import com.projeto.vault.dto.request.UpdateUserRequest;
import com.projeto.vault.dto.response.UserResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller de usuário autenticado.
 */
@RestController
@RequestMapping("/api/users")
@Tag(name = "Usuário", description = "Operações do usuário autenticado")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Perfil do usuário autenticado")
    public ResponseEntity<UserResponse> getProfile() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping("/me")
    @Operation(summary = "Atualizar perfil do usuário autenticado")
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UpdateUserRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Alterar senha do usuário autenticado")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        userService.changePassword(userId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me")
    @Operation(summary = "Desativar conta do usuário autenticado")
    public ResponseEntity<Void> deactivateAccount() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        userService.deactivateAccount(userId);
        return ResponseEntity.noContent().build();
    }
}
