package com.finmitra.dto;

import java.math.BigDecimal;

public class BudgetResponse {

    private Long id;
    private String category;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;

    public BudgetResponse() {
    }

    public BudgetResponse(Long id, String category, BigDecimal limitAmount, BigDecimal spentAmount) {
        this.id = id;
        this.category = category;
        this.limitAmount = limitAmount;
        this.spentAmount = spentAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(BigDecimal spentAmount) {
        this.spentAmount = spentAmount;
    }
}
