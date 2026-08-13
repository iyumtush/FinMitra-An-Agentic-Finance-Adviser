package com.finmitra.service.impl;

import com.finmitra.dto.*;
import com.finmitra.entity.User;
import com.finmitra.exception.APIException;
import com.finmitra.repository.UserRepository;
import com.finmitra.security.JwtTokenProvider;
import com.finmitra.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public AuthResponse signup(SignupRequest signupRequest) {
        String normalizedEmail = signupRequest.getEmail().trim().toLowerCase();
        // Check if email is already registered
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Email is already registered!");
        }

        // Create new user entity & hash password using BCrypt
        User user = new User();
        user.setName(signupRequest.getName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

        User savedUser = userRepository.save(user);

        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getName(), savedUser.getEmail());

        return new AuthResponse("User registered successfully", userDto);
    }

    @Override
    public JwtAuthResponse login(LoginRequest loginRequest) {
        String normalizedEmail = loginRequest.getEmail().trim().toLowerCase();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        normalizedEmail,
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        UserDto userDto = new UserDto(user.getId(), user.getName(), user.getEmail());

        return new JwtAuthResponse(token, userDto);
    }
}
