package com.finmitra.controller;

import com.finmitra.dto.AIInsightResponse;
import com.finmitra.dto.ChatRequest;
import com.finmitra.dto.ChatResponse;
import com.finmitra.service.AIService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/insights")
    public ResponseEntity<AIInsightResponse> getInsights(Authentication authentication) {
        String userEmail = authentication.getName();
        AIInsightResponse insights = aiService.generateInsights(userEmail);
        return ResponseEntity.ok(insights);
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        ChatResponse response = aiService.chatWithAI(userEmail, request);
        return ResponseEntity.ok(response);
    }
}
