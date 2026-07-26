package com.finmitra.service;

import com.finmitra.dto.AuthResponse;
import com.finmitra.dto.JwtAuthResponse;
import com.finmitra.dto.LoginRequest;
import com.finmitra.dto.SignupRequest;

public interface AuthService {
    AuthResponse signup(SignupRequest signupRequest);
    JwtAuthResponse login(LoginRequest loginRequest);
}
