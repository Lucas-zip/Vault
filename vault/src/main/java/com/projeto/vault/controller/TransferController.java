package com.projeto.vault.controller;

import com.projeto.vault.dto.request.TransferRequest;
import com.projeto.vault.dto.response.TransactionResponse;
import com.projeto.vault.security.SecurityUtils;
import com.projeto.vault.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller de transferências entre contas do mesmo usuário.
 */
@RestController
@RequestMapping("/api/transfers")
@Tag(name = "Transferências", description = "Transferência de valores entre contas")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    @Operation(summary = "Transferir entre contas",
            description = "Move o valor da conta de origem para a de destino, ajustando os saldos")
    public ResponseEntity<TransactionResponse> transfer(@Valid @RequestBody TransferRequest request) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED).body(transferService.transfer(userId, request));
    }
}
