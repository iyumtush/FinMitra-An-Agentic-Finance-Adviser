package com.finmitra.service;

import com.finmitra.dto.BudgetRequest;
import com.finmitra.dto.BudgetResponse;
import java.util.List;

public interface BudgetService {
    BudgetResponse setBudget(String userEmail, BudgetRequest request);
    List<BudgetResponse> getUserBudgets(String userEmail);
}
