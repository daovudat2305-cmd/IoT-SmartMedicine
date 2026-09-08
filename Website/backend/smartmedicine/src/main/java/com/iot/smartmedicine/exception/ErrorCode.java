package com.iot.smartmedicine.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter 
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(500, "Unknown Exception", HttpStatus.INTERNAL_SERVER_ERROR),
    FORBIDDEN(403, "Access denied", HttpStatus.FORBIDDEN),
    UNAUTHORIZED(401, "Authentication is required", HttpStatus.UNAUTHORIZED),
    BAD_CREDENTIALS(401, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    
    USER_NOT_FOUND(404, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND);


    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
