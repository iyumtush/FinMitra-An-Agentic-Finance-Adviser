package com.finmitra.dto;

import java.math.BigDecimal;
import java.util.List;

public class AIInsightResponse {

    private String monthlySummary;
    private List<String> savingSuggestions;
    private String growthIdea;
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;
    private String topCategory;

    public AIInsightResponse() {
    }

    public AIInsightResponse(String monthlySummary, List<String> savingSuggestions, String growthIdea, BigDecimal income, BigDecimal expense, BigDecimal savings, String topCategory) {
        this.monthlySummary = monthlySummary;
        this.savingSuggestions = savingSuggestions;
        this.growthIdea = growthIdea;
        this.income = income;
        this.expense = expense;
        this.savings = savings;
        this.topCategory = topCategory;
    }

    public String getMonthlySummary() {
        return monthlySummary;
    }

    public void setMonthlySummary(String monthlySummary) {
        this.monthlySummary = monthlySummary;
    }

    public List<String> getSavingSuggestions() {
        return savingSuggestions;
    }

    public void setSavingSuggestions(List<String> savingSuggestions) {
        this.savingSuggestions = savingSuggestions;
    }

    public String getGrowthIdea() {
        return growthIdea;
    }

    public void setGrowthIdea(String growthIdea) {
        this.growthIdea = growthIdea;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public BigDecimal getExpense() {
        return expense;
    }

    public void setExpense(BigDecimal expense) {
        this.expense = expense;
    }

    public BigDecimal getSavings() {
        return savings;
    }

    public void setSavings(BigDecimal savings) {
        this.savings = savings;
    }

    public String getTopCategory() {
        return topCategory;
    }

    public void setTopCategory(String topCategory) {
        this.topCategory = topCategory;
    }
}
