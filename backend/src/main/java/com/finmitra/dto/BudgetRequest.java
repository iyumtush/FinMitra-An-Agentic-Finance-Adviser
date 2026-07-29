package com.finmitra.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BudgetRequest {

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Limit amount is required")
    @DecimalMin(value = "0.01", message = "Limit amount must be greater than zero")
    private BigDecimal limitAmount;

    public BudgetRequest() {
    }

    public BudgetRequest(String category, BigDecimal limitAmount) {
        this.category = category;
        this.limitAmount = limitAmount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getLimitAmount() {
        return limitAmount;
    }

    public void setLimitAmount(BigDecimal limitAmount) {
        this.limitAmount = limitAmount;
    }
}
