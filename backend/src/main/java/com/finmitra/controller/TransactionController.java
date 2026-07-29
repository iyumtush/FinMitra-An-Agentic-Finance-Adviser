package com.finmitra.controller;

import com.finmitra.dto.TransactionRequest;
import com.finmitra.dto.TransactionResponse;
import com.finmitra.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        TransactionResponse response = transactionService.createTransaction(userEmail, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getUserTransactions(Authentication authentication) {
        String userEmail = authentication.getName();
        List<TransactionResponse> transactions = transactionService.getUserTransactions(userEmail);
        return ResponseEntity.ok(transactions);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTransaction(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        transactionService.deleteTransaction(userEmail, id);
        return ResponseEntity.ok("Transaction deleted successfully");
    }
}
