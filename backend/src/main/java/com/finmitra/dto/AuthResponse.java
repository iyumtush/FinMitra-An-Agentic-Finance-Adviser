package com.finmitra.dto;

public class AuthResponse {
    private String message;
    private UserDto user;

    public AuthResponse() {
    }

    public AuthResponse(String message, UserDto user) {
        this.message = message;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }
}
