package com.iot.smartmedicine.exception;

import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.iot.smartmedicine.dto.response.ApiResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j 
@RestControllerAdvice 
public class GlobalExceptionHandler {

    @ExceptionHandler (Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception exception) {
        log.error("Exception occurred", exception);

        ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;

        ApiResponse<Void> response = ApiResponse.error(errorCode.getCode(), errorCode.getMessage());

        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    @ExceptionHandler (AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        log.warn("AppException: code={}, message={}", errorCode.getCode(), errorCode.getMessage());

        ApiResponse<Void> response = ApiResponse.error(errorCode.getCode(), errorCode.getMessage());
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }

    @ExceptionHandler ({CompletionException.class, ExecutionException.class})
    public ResponseEntity<ApiResponse<Void>> handleAsyncException(Exception exception) {
        Throwable cause = exception.getCause();
        if(cause instanceof AppException appEx) {
            return handleAppException(appEx);
        }
        return handleException(exception);
    }
}
