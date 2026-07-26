package com.finmitra.dto;

public class JwtAuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserDto user;

    public JwtAuthResponse() {
    }

    public JwtAuthResponse(String accessToken, UserDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public JwtAuthResponse(String accessToken, String tokenType, UserDto user) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }
}
