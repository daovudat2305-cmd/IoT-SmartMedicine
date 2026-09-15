package com.iot.smartmedicine.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter 
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(500, "Unknown Exception", HttpStatus.INTERNAL_SERVER_ERROR),
    FORBIDDEN(403, "Access denied", HttpStatus.FORBIDDEN),
    UNAUTHORIZED(401, "Authentication is required", HttpStatus.UNAUTHORIZED),
    BAD_CREDENTIALS(401, "Email hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    
    USER_NOT_FOUND(404, "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    DEVICE_NOT_FOUND(404, "Không tìm thấy thiết bị", HttpStatus.NOT_FOUND),
    INVALID_ACTION_STATUS(400, "Trạng thái hành động không hợp lệ", HttpStatus.BAD_REQUEST),
    
    DEVICE_NOT_RESPONDING(504, "Thiết bị không phản hồi, vui lòng kiểm tra lại kết nối thiết bị", HttpStatus.GATEWAY_TIMEOUT);


    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
