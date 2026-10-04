package com.bicap.trading_order_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public org.springframework.http.ResponseEntity<java.util.Map<String,Object>> handleStatus(org.springframework.web.server.ResponseStatusException ex) {
        return org.springframework.http.ResponseEntity.status(ex.getStatusCode()).body(java.util.Map.of(
            "status", ex.getStatusCode().value(), "error", ex.getReason() != null ? ex.getReason() : "Yêu cầu không hợp lệ."));
    }

    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public org.springframework.http.ResponseEntity<java.util.Map<String,Object>> handleValidation(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("status", 400, "error", "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra các trường bắt buộc và giới hạn độ dài."));
    }

    @ExceptionHandler(ProductNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleProductNotFound(ProductNotFoundException ex) {
        return ex.getMessage();
    }
}
