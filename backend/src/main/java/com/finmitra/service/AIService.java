package com.finmitra.service;

import com.finmitra.dto.AIInsightResponse;
import com.finmitra.dto.ChatRequest;
import com.finmitra.dto.ChatResponse;

public interface AIService {
    AIInsightResponse generateInsights(String userEmail);
    ChatResponse chatWithAI(String userEmail, ChatRequest request);
}
