package com.finmitra.service.impl;

import com.finmitra.dto.AIInsightResponse;
import com.finmitra.dto.ChatRequest;
import com.finmitra.dto.ChatResponse;
import com.finmitra.entity.Budget;
import com.finmitra.entity.Transaction;
import com.finmitra.entity.User;
import com.finmitra.exception.APIException;
import com.finmitra.repository.BudgetRepository;
import com.finmitra.repository.TransactionRepository;
import com.finmitra.repository.UserRepository;
import com.finmitra.service.AIService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIServiceImpl implements AIService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public AIServiceImpl(UserRepository userRepository,
                         TransactionRepository transactionRepository,
                         BudgetRepository budgetRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
    }

    @Override
    public AIInsightResponse generateInsights(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDescIdDesc(user.getId());
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryTotals = new HashMap<>();

        for (Transaction t : transactions) {
            BigDecimal amt = t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO;
            String type = t.getType() != null ? t.getType().toUpperCase() : "EXPENSE";
            String cat = t.getCategory() != null ? t.getCategory() : "Other";

            if ("INCOME".equals(type)) {
                totalIncome = totalIncome.add(amt);
            } else {
                totalExpense = totalExpense.add(amt);
                categoryTotals.put(cat, categoryTotals.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            }
        }

        BigDecimal savings = totalIncome.subtract(totalExpense);

        // Find Top Expense Category
        String topCatName = "None";
        BigDecimal topCatAmount = BigDecimal.ZERO;

        for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
            if (entry.getValue().compareTo(topCatAmount) > 0) {
                topCatAmount = entry.getValue();
                topCatName = entry.getKey();
            }
        }

        // 1. Monthly Summary Text
        String summary;
        if (transactions.isEmpty()) {
          summary = "Welcome " + user.getName() + "! No transactions recorded yet. Log your income and expenses to generate personalized AI insights.";
        } else {
          summary = String.format("You earned ₹%,.2f and spent ₹%,.2f this period, leaving ₹%,.2f in net savings. Your highest spend category was %s at ₹%,.2f.",
                  totalIncome, totalExpense, savings, topCatName, topCatAmount);
        }

        // 2. Saving Suggestions
        List<String> suggestions = new ArrayList<>();
        if (!topCatName.equals("None") && topCatAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal cut15 = topCatAmount.multiply(new BigDecimal("0.15")).setScale(2, RoundingMode.HALF_UP);
            suggestions.add(String.format("%s is your highest spend category (₹%,.2f) — even a 15%% cut here would save you ₹%,.2f each month.",
                    topCatName, topCatAmount, cut15));
        }

        // Check budget warnings
        for (Budget b : budgets) {
            BigDecimal spent = categoryTotals.getOrDefault(b.getCategory(), BigDecimal.ZERO);
            if (spent.compareTo(b.getLimitAmount()) > 0) {
                BigDecimal over = spent.subtract(b.getLimitAmount());
                suggestions.add(String.format("Warning: Your '%s' expenses (₹%,.2f) have exceeded your monthly budget limit of ₹%,.2f by ₹%,.2f.",
                        b.getCategory(), spent, b.getLimitAmount(), over));
            }
        }

        if (suggestions.isEmpty()) {
            suggestions.add("Try setting a fixed weekly spending cap for non-essential purchases like dining out and online shopping.");
        }

        // 3. Growth Idea
        String growth;
        if (savings.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal sip = savings.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP);
            growth = String.format("With ₹%,.2f in net savings, allocating 30%% (₹%,.2f/month) into a Recurring Deposit (RD) or Index Fund SIP can build long-term wealth safely.", savings, sip);
        } else {
            growth = "Focus on bringing expenses below total income. Once consistent savings are built, explore SIPs or liquid mutual funds as a starting point.";
        }

        return new AIInsightResponse(summary, suggestions, growth, totalIncome, totalExpense, savings, topCatName);
    }

    @Override
    public ChatResponse chatWithAI(String userEmail, ChatRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        String message = request.getMessage().toLowerCase();
        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDescIdDesc(user.getId());
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        Map<String, BigDecimal> categoryTotals = new HashMap<>();

        for (Transaction t : transactions) {
            BigDecimal amt = t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO;
            String type = t.getType() != null ? t.getType().toUpperCase() : "EXPENSE";
            String cat = t.getCategory() != null ? t.getCategory() : "Other";

            if ("INCOME".equals(type)) {
                totalIncome = totalIncome.add(amt);
            } else {
                totalExpense = totalExpense.add(amt);
                categoryTotals.put(cat.toLowerCase(), categoryTotals.getOrDefault(cat.toLowerCase(), BigDecimal.ZERO).add(amt));
            }
        }

        BigDecimal savings = totalIncome.subtract(totalExpense);

        // Find Top Category
        String topCatName = "None";
        BigDecimal topCatAmount = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
            if (entry.getValue().compareTo(topCatAmount) > 0) {
                topCatAmount = entry.getValue();
                topCatName = entry.getKey();
            }
        }

        // Conversational AI Logic matching user prompt
        String reply;

        if (message.contains("income") || message.contains("salary") || message.contains("earned")) {
            reply = String.format("Hi %s! Your total logged income is ₹%,.2f across %d income entries.",
                    user.getName(), totalIncome, transactions.stream().filter(t -> "INCOME".equalsIgnoreCase(t.getType())).count());
        } else if (message.contains("expense") || message.contains("spent") || message.contains("spend")) {
            // Check if specific category mentioned in query
            Optional<String> matchedCat = categoryTotals.keySet().stream().filter(c -> message.contains(c)).findFirst();
            if (matchedCat.isPresent()) {
                String catName = matchedCat.get();
                BigDecimal catAmt = categoryTotals.get(catName);
                reply = String.format("You have spent ₹%,.2f on '%s' this period.", catAmt, catName);
            } else {
                reply = String.format("Your total expenses stand at ₹%,.2f. Your highest spend category is '%s' at ₹%,.2f.",
                        totalExpense, topCatName, topCatAmount);
            }
        } else if (message.contains("saving") || message.contains("saved") || message.contains("balance")) {
            reply = String.format("You have saved ₹%,.2f this period (Income: ₹%,.2f - Expense: ₹%,.2f).",
                    savings, totalIncome, totalExpense);
        } else if (message.contains("budget") || message.contains("limit")) {
            if (budgets.isEmpty()) {
                reply = "You haven't set any monthly category budget limits yet. Click 'Set Budget Limit' in the Budget tab to add one!";
            } else {
                StringBuilder sb = new StringBuilder("Here is your current budget status:\n");
                for (Budget b : budgets) {
                    BigDecimal spent = categoryTotals.getOrDefault(b.getCategory().toLowerCase(), BigDecimal.ZERO);
                    boolean over = spent.compareTo(b.getLimitAmount()) > 0;
                    sb.append(String.format("• %s: ₹%,.2f / ₹%,.2f %s\n",
                            b.getCategory(), spent, b.getLimitAmount(), over ? "⚠️ OVER BUDGET" : "✅ ON TRACK"));
                }
                reply = sb.toString();
            }
        } else if (message.contains("highest") || message.contains("top") || message.contains("biggest")) {
            reply = String.format("Your biggest single expense category is '%s' with a total spend of ₹%,.2f.", topCatName, topCatAmount);
        } else if (message.contains("tip") || message.contains("advice") || message.contains("how to save")) {
            reply = String.format("Mitra AI Tip: Your net savings are ₹%,.2f. Consider cutting 10%% off your '%s' spending (saving ~₹%,.2f) and putting it into an RD or SIP!",
                    savings, topCatName, topCatAmount.multiply(new BigDecimal("0.10")));
        } else {
            reply = String.format("I'm Mitra AI, your personal financial assistant! You can ask me about your income (₹%,.2f), total expenses (₹%,.2f), savings (₹%,.2f), category spends, or budget limits.",
                    totalIncome, totalExpense, savings);
        }

        return new ChatResponse(reply);
    }
}
