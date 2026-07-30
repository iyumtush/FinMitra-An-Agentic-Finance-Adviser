package com.finmitra.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class AIServiceImpl implements AIService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:AIzaSyAueqYx9GZetsU4M2MTcUJEGX9MZpdVTw0}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String geminiApiUrl;

    public AIServiceImpl(UserRepository userRepository,
                         TransactionRepository transactionRepository,
                         BudgetRepository budgetRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
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

        String topCatName = "None";
        BigDecimal topCatAmount = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
            if (entry.getValue().compareTo(topCatAmount) > 0) {
                topCatAmount = entry.getValue();
                topCatName = entry.getKey();
            }
        }

        // Rule-Based Defaults
        String summary = String.format("You earned ₹%,.2f and spent ₹%,.2f this period, leaving ₹%,.2f in net savings. Your highest spend category was %s at ₹%,.2f.",
                totalIncome, totalExpense, savings, topCatName, topCatAmount);

        List<String> suggestions = new ArrayList<>();
        if (!topCatName.equals("None") && topCatAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal cut15 = topCatAmount.multiply(new BigDecimal("0.15")).setScale(2, RoundingMode.HALF_UP);
            suggestions.add(String.format("%s is your highest spend category (₹%,.2f) — even a 15%% cut here would save you ₹%,.2f each month.",
                    topCatName, topCatAmount, cut15));
        }

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

        String growth;
        if (savings.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal sip = savings.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP);
            growth = String.format("With ₹%,.2f in net savings, allocating 30%% (₹%,.2f/month) into a Recurring Deposit (RD) or Index Fund SIP can build long-term wealth safely.", savings, sip);
        } else {
            growth = "Focus on bringing expenses below total income. Once consistent savings are built, explore SIPs or liquid mutual funds as a starting point.";
        }

        // Attempt Gemini API call for enhanced insight summary
        try {
            String prompt = String.format("As a professional AI financial advisor named Mitra AI, analyze this user data for %s: Total Income: ₹%.2f, Total Expenses: ₹%.2f, Net Savings: ₹%.2f, Highest Category: %s (₹%.2f). Give a short 2-sentence encouraging monthly summary.",
                    user.getName(), totalIncome, totalExpense, savings, topCatName, topCatAmount);
            String geminiSummary = callGeminiApi(prompt);
            if (geminiSummary != null && !geminiSummary.trim().isEmpty()) {
                summary = geminiSummary.trim();
            }
        } catch (Exception e) {
            System.err.println("Gemini API fallback for insights: " + e.getMessage());
        }

        return new AIInsightResponse(summary, suggestions, growth, totalIncome, totalExpense, savings, topCatName);
    }

    @Override
    public ChatResponse chatWithAI(String userEmail, ChatRequest request) {
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

        // Build Full Context Prompt for Gemini API
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append(String.format("User Profile: %s (%s)\n", user.getName(), user.getEmail()));
        contextBuilder.append(String.format("Financial Summary: Total Income = ₹%.2f, Total Expense = ₹%.2f, Net Savings = ₹%.2f\n",
                totalIncome, totalExpense, savings));
        contextBuilder.append("Expenses by Category:\n");
        categoryTotals.forEach((cat, val) -> contextBuilder.append(String.format("- %s: ₹%.2f\n", cat, val)));
        contextBuilder.append("Monthly Budgets:\n");
        budgets.forEach(b -> contextBuilder.append(String.format("- %s: Limit ₹%.2f\n", b.getCategory(), b.getLimitAmount())));

        String systemPrompt = "You are Mitra AI, an expert, friendly AI Personal Finance Assistant for FinMitra. " +
                "Answer the user's question concisely based on their exact financial context provided below. " +
                "Use currency symbol ₹ and keep responses under 4 sentences.\n\n" +
                "CONTEXT:\n" + contextBuilder.toString() + "\n" +
                "USER QUESTION: " + request.getMessage();

        try {
            String geminiReply = callGeminiApi(systemPrompt);
            if (geminiReply != null && !geminiReply.trim().isEmpty()) {
                return new ChatResponse(geminiReply.trim());
            }
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
        }

        // Rule-Based Fallback if API offline
        String userQuery = request.getMessage().toLowerCase();
        String fallbackReply;

        if (userQuery.contains("income") || userQuery.contains("salary")) {
            fallbackReply = String.format("Your total logged income is ₹%,.2f.", totalIncome);
        } else if (userQuery.contains("expense") || userQuery.contains("spent")) {
            fallbackReply = String.format("Your total expenses stand at ₹%,.2f.", totalExpense);
        } else if (userQuery.contains("saving") || userQuery.contains("balance")) {
            fallbackReply = String.format("Your net savings are ₹%,.2f (Income: ₹%,.2f - Expense: ₹%,.2f).", savings, totalIncome, totalExpense);
        } else {
            fallbackReply = String.format("Mitra AI: You earned ₹%,.2f, spent ₹%,.2f, and saved ₹%,.2f this period.", totalIncome, totalExpense, savings);
        }

        return new ChatResponse(fallbackReply);
    }

    private String callGeminiApi(String promptText) throws Exception {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            return null;
        }

        String fullUrl = geminiApiUrl + "?key=" + geminiApiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", promptText);

        Map<String, Object> partsObj = new HashMap<>();
        partsObj.put("parts", Collections.singletonList(textPart));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(partsObj));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                return textNode.asText();
            }
        }
        return null;
    }
}
