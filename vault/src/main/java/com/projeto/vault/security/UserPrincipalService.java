package com.projeto.vault.security;

import com.projeto.vault.entity.User;
import com.projeto.vault.exception.ResourceNotFoundException;
import com.projeto.vault.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Serviço que carrega o {@link UserPrincipal} pelo e-mail (username),
 * usado pelo Spring Security na autenticação.
 */
@Service
public class UserPrincipalService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserPrincipalService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
        return new UserPrincipal(user);
    }
}
