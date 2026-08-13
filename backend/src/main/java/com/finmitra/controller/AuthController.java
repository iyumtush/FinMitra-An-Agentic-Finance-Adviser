package com.finmitra.controller;

import com.finmitra.dto.AuthResponse;
import com.finmitra.dto.JwtAuthResponse;
import com.finmitra.dto.LoginRequest;
import com.finmitra.dto.SignupRequest;
import com.finmitra.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/signup")
    public ResponseEntity<java.util.Map<String, String>> getSignupInstruction() {
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Signup endpoint requires HTTP POST with JSON body: { name, email, password }.",
            "status", "Use the web app form to submit POST request."
        ));
    }

    // Build Signup REST API
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest signupRequest) {
        AuthResponse response = authService.signup(signupRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/login")
    public ResponseEntity<java.util.Map<String, String>> getLoginInstruction() {
        return ResponseEntity.ok(java.util.Map.of(
            "message", "Login endpoint requires HTTP POST with JSON body: { email, password }.",
            "status", "Use the web app form to submit POST request."
        ));
    }

    // Build Login REST API
    @PostMapping("/login")
    public ResponseEntity<JwtAuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
}
