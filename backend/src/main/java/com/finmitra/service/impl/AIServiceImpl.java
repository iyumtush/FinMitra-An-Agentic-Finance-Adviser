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

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent}")
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
        String summary = String.format("Hi %s! You earned ₹%,.2f and spent ₹%,.2f this period, leaving ₹%,.2f in net savings. Your highest spend category was %s at ₹%,.2f.",
                user.getName(), totalIncome, totalExpense, savings, topCatName, topCatAmount);

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
            String prompt = String.format("You are FinMitra AI, an intelligent personal finance assistant. User Name: %s. Total Income: ₹%.2f, Total Expenses: ₹%.2f, Net Savings: ₹%.2f, Top Category: %s (₹%.2f). Write a warm 2-sentence financial summary addressing %s.",
                    user.getName(), totalIncome, totalExpense, savings, topCatName, topCatAmount, user.getName());
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

        String topCatName = "None";
        BigDecimal topCatAmount = BigDecimal.ZERO;
        for (Map.Entry<String, BigDecimal> entry : categoryTotals.entrySet()) {
            if (entry.getValue().compareTo(topCatAmount) > 0) {
                topCatAmount = entry.getValue();
                topCatName = entry.getKey();
            }
        }

        // Build Data Context for Gemini API
        StringBuilder contextBuilder = new StringBuilder();
        contextBuilder.append(String.format("USER PROFILE: %s (Email: %s)\n", user.getName(), user.getEmail()));
        contextBuilder.append(String.format("FINANCIAL STATUS: Total Income = ₹%.2f, Total Expenses = ₹%.2f, Monthly Net Savings = ₹%.2f\n\n",
                totalIncome, totalExpense, savings));

        contextBuilder.append("EXPENSES BY CATEGORY:\n");
        if (categoryTotals.isEmpty()) {
            contextBuilder.append("No expenses recorded.\n");
        } else {
            categoryTotals.forEach((cat, val) -> contextBuilder.append(String.format("- %s: ₹%.2f\n", cat, val)));
        }

        contextBuilder.append("\nMONTHLY BUDGET LIMITS:\n");
        if (budgets.isEmpty()) {
            contextBuilder.append("No monthly budget limits set.\n");
        } else {
            budgets.forEach(b -> contextBuilder.append(String.format("- %s: Limit ₹%.2f\n", b.getCategory(), b.getLimitAmount())));
        }

        String userQuery = request.getMessage().trim();

        String systemPrompt = String.format(
                "You are FinMitra AI, an expert financial advisor for %s. " +
                "Evaluate the user's financial question thoughtfully using their real data provided below.\n" +
                "GUIDELINES:\n" +
                "1. Address %s directly.\n" +
                "2. If asked about taking a loan, buying a car/house/phone, or making a big purchase: Evaluate if their monthly net savings (₹%.2f) can comfortably cover the purchase or EMI without compromising essential expenses. Give practical advice.\n" +
                "3. If asked about category spending, state the exact category and amount from their data.\n" +
                "4. If asked something completely off-topic (e.g. sports scores, cooking, movies), reply: 'That question is unrelated to your financial data! Ask me about your expenses, loans, budgets, or savings.'\n" +
                "5. Keep responses concise, warm, professional, and within 3-4 sentences.\n\n" +
                "REAL USER FINANCIAL CONTEXT:\n%s\n\n" +
                "USER QUESTION: %s",
                user.getName(), user.getName(), savings, contextBuilder.toString(), userQuery
        );

        try {
            String geminiReply = callGeminiApi(systemPrompt);
            if (geminiReply != null && !geminiReply.trim().isEmpty()) {
                return new ChatResponse(geminiReply.trim());
            }
        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
        }

        // Comprehensive Smart Conversational Fallback Engine
        String lowerQuery = userQuery.toLowerCase();
        String fallbackReply;

        if (lowerQuery.matches(".*\\b(hello|hi|hey|greetings|hola)\\b.*")) {
            fallbackReply = String.format("Hi %s! How are you doing today? How can I help you manage your finances, loans, or savings?", user.getName());
        } else if (lowerQuery.contains("how are you")) {
            fallbackReply = String.format("I'm doing great, %s! Ready to help you with your budget, loans, or investment decisions!", user.getName());
        } else if (lowerQuery.contains("loan") || lowerQuery.contains("car") || lowerQuery.contains("emi") || lowerQuery.contains("vehicle") || lowerQuery.contains("buy") || lowerQuery.contains("purchase") || lowerQuery.contains("afford")) {
            BigDecimal maxSafeEmi = savings.multiply(new BigDecimal("0.35")).setScale(2, RoundingMode.HALF_UP);
            if (savings.compareTo(BigDecimal.ZERO) > 0) {
                fallbackReply = String.format("Hi %s! With your monthly income of ₹%,.2f and net savings of ₹%,.2f, taking a loan is feasible if your monthly EMI stays below ~₹%,.2f (35%% of your net savings). Make sure to keep an emergency fund intact!",
                        user.getName(), totalIncome, savings, maxSafeEmi);
            } else {
                fallbackReply = String.format("Hi %s, your current expenses (₹%,.2f) equal or exceed your income (₹%,.2f). Taking a new loan now is risky — try reducing expenses first to create positive net savings!",
                        user.getName(), totalExpense, totalIncome);
            }
        } else if ((lowerQuery.contains("which") || lowerQuery.contains("what") || lowerQuery.contains("highest") || lowerQuery.contains("most"))
                && (lowerQuery.contains("category") || lowerQuery.contains("spend") || lowerQuery.contains("expense"))) {
            if (!topCatName.equals("None") && topCatAmount.compareTo(BigDecimal.ZERO) > 0) {
                fallbackReply = String.format("Hi %s, you spend the most money on '%s' with a total expense of ₹%,.2f.",
                        user.getName(), topCatName, topCatAmount);
            } else {
                fallbackReply = String.format("Hi %s, you haven't logged any category expenses yet.", user.getName());
            }
        } else if (lowerQuery.contains("income") || lowerQuery.contains("salary") || lowerQuery.contains("earned")) {
            fallbackReply = String.format("Hi %s, your total logged income is ₹%,.2f.", user.getName(), totalIncome);
        } else if (lowerQuery.contains("expense") || lowerQuery.contains("spent") || lowerQuery.contains("spend")) {
            Optional<String> matchedCat = categoryTotals.keySet().stream().filter(c -> lowerQuery.contains(c.toLowerCase())).findFirst();
            if (matchedCat.isPresent()) {
                String catName = matchedCat.get();
                BigDecimal catAmt = categoryTotals.get(catName);
                fallbackReply = String.format("Hi %s, you have spent ₹%,.2f on '%s' this period.", user.getName(), catAmt, catName);
            } else {
                fallbackReply = String.format("Hi %s, your total expenses are ₹%,.2f. Your highest spend category is '%s' (₹%,.2f).",
                        user.getName(), totalExpense, topCatName, topCatAmount);
            }
        } else if (lowerQuery.contains("saving") || lowerQuery.contains("balance") || lowerQuery.contains("invest") || lowerQuery.contains("sip")) {
            fallbackReply = String.format("Hi %s, your net savings stand at ₹%,.2f. Consider putting 30%% of savings (₹%,.2f/month) into an RD or SIP!",
                    user.getName(), savings, savings.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP));
        } else if (lowerQuery.contains("weather") || lowerQuery.contains("recipe") || lowerQuery.contains("match") || lowerQuery.contains("movie") || lowerQuery.contains("cricket")) {
            fallbackReply = String.format("Hi %s, that question is unrelated to your financial data! Feel free to ask me about your expenses, loans, budgets, or savings.", user.getName());
        } else {
            fallbackReply = String.format("Hi %s! You have earned ₹%,.2f and spent ₹%,.2f this period, giving ₹%,.2f in net savings. Ask me about loans, purchases, budgets, or savings advice!",
                    user.getName(), totalIncome, totalExpense, savings);
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
