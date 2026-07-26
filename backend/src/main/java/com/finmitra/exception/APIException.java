package com.finmitra.exception;

import org.springframework.http.HttpStatus;

public class APIException extends RuntimeException {

    private final HttpStatus status;
    private final String message;

    public APIException(HttpStatus status, String message) {
        super(message);
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() {
        return status;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
