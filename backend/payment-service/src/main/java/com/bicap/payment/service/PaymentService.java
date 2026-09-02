package com.bicap.payment.service;

import com.bicap.payment.dto.CreatePaymentRequest;
import com.bicap.payment.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(CreatePaymentRequest request);
    PaymentResponse getPaymentById(Long id);
    PaymentResponse getPaymentByCode(String paymentCode);
    List<PaymentResponse> getPaymentsByOrderId(Long orderId);
    PaymentResponse processPayment(Long id, String transactionId);
    PaymentResponse confirmPayment(Long id);
    PaymentResponse failPayment(Long id, String reason);
}
