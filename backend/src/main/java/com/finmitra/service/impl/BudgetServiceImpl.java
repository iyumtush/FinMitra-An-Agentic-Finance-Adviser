package com.finmitra.service.impl;

import com.finmitra.dto.BudgetRequest;
import com.finmitra.dto.BudgetResponse;
import com.finmitra.entity.Budget;
import com.finmitra.entity.Transaction;
import com.finmitra.entity.User;
import com.finmitra.exception.APIException;
import com.finmitra.repository.BudgetRepository;
import com.finmitra.repository.TransactionRepository;
import com.finmitra.repository.UserRepository;
import com.finmitra.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public BudgetServiceImpl(BudgetRepository budgetRepository, TransactionRepository transactionRepository, UserRepository userRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public BudgetResponse setBudget(String userEmail, BudgetRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategory(user.getId(), request.getCategory());

        Budget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.setLimitAmount(request.getLimitAmount());
        } else {
            budget = new Budget();
            budget.setUser(user);
            budget.setCategory(request.getCategory());
            budget.setLimitAmount(request.getLimitAmount());
        }

        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved, calculateSpent(user.getId(), saved.getCategory()));
    }

    @Override
    public List<BudgetResponse> getUserBudgets(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        return budgets.stream()
                .map(b -> mapToResponse(b, calculateSpent(user.getId(), b.getCategory())))
                .collect(Collectors.toList());
    }

    private BigDecimal calculateSpent(Long userId, String category) {
        if (category == null) return BigDecimal.ZERO;
        
        List<Transaction> allTransactions = transactionRepository.findByUserIdOrderByDateDescIdDesc(userId);
        return allTransactions.stream()
                .filter(t -> t.getType() != null && "EXPENSE".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getCategory() != null && t.getCategory().equalsIgnoreCase(category))
                .map(t -> t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BudgetResponse mapToResponse(Budget b, BigDecimal spentAmount) {
        return new BudgetResponse(
                b.getId(),
                b.getCategory(),
                b.getLimitAmount(),
                spentAmount
        );
    }
}
