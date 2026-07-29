package com.finmitra.controller;

import com.finmitra.dto.BudgetRequest;
import com.finmitra.dto.BudgetResponse;
import com.finmitra.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> setBudget(
            @Valid @RequestBody BudgetRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        BudgetResponse response = budgetService.setBudget(userEmail, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getUserBudgets(Authentication authentication) {
        String userEmail = authentication.getName();
        List<BudgetResponse> budgets = budgetService.getUserBudgets(userEmail);
        return ResponseEntity.ok(budgets);
    }
}
