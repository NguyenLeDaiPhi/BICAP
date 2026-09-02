package com.bicap.payment.dto;

import com.bicap.payment.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private String paymentCode;
    private Long orderId;
    private Long payerId;
    private Long payeeId;
    private BigDecimal amount;
    private BigDecimal depositAmount;
    private Payment.PaymentType type;
    private Payment.PaymentStatus status;
    private String paymentMethod;
    private String transactionId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static PaymentResponse fromEntity(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentCode(payment.getPaymentCode())
                .orderId(payment.getOrderId())
                .payerId(payment.getPayerId())
                .payeeId(payment.getPayeeId())
                .amount(payment.getAmount())
                .depositAmount(payment.getDepositAmount())
                .type(payment.getType())
                .status(payment.getStatus())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .description(payment.getDescription())
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getCompletedAt())
                .build();
    }
}
