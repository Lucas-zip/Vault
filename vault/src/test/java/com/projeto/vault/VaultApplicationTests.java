package com.projeto.vault;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Teste de smoke para verificar se o contexto da aplicação sobe.
 *
 * <p>Usa o profile "test" que fornece um banco H2 em memória
 * (modo PostgreSQL) de forma que o mapeamento das entidades é
 * validado sem depender de um servidor PostgreSQL real.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
class VaultApplicationTests {

    @Test
    void contextLoads() {
        // Verifica que o Spring ApplicationContext é iniciado sem erros.
    }
}
