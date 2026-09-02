package com.bicap.payment.controller;

import com.bicap.payment.dto.ApiResponse;
import com.bicap.payment.dto.CreatePaymentRequest;
import com.bicap.payment.dto.PaymentResponse;
import com.bicap.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Thanh toán", description = "Quản lý thanh toán")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Tạo thanh toán mới", description = "Tạo một yêu cầu thanh toán mới")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        PaymentResponse payment = paymentService.createPayment(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo thanh toán thành công", payment));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin thanh toán", description = "Trả về thông tin thanh toán theo ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    @GetMapping("/code/{paymentCode}")
    @Operation(summary = "Lấy thông tin thanh toán theo mã", description = "Trả về thông tin thanh toán theo mã thanh toán")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByCode(@PathVariable String paymentCode) {
        PaymentResponse payment = paymentService.getPaymentByCode(paymentCode);
        return ResponseEntity.ok(ApiResponse.success(payment));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Lấy danh sách thanh toán theo đơn hàng", description = "Trả về danh sách thanh toán của một đơn hàng")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByOrderId(@PathVariable Long orderId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(payments));
    }

    @PostMapping("/{id}/process")
    @Operation(summary = "Xử lý thanh toán", description = "Bắt đầu xử lý thanh toán")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @PathVariable Long id,
            @RequestParam String transactionId) {
        PaymentResponse payment = paymentService.processPayment(id, transactionId);
        return ResponseEntity.ok(ApiResponse.success("Bắt đầu xử lý thanh toán", payment));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Xác nhận thanh toán", description = "Xác nhận thanh toán thành công")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(@PathVariable Long id) {
        PaymentResponse payment = paymentService.confirmPayment(id);
        return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công", payment));
    }

    @PostMapping("/{id}/fail")
    @Operation(summary = "Thanh toán thất bại", description = "Đánh dấu thanh toán thất bại")
    public ResponseEntity<ApiResponse<PaymentResponse>> failPayment(
            @PathVariable Long id,
            @RequestParam String reason) {
        PaymentResponse payment = paymentService.failPayment(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Thanh toán thất bại", payment));
    }
}
