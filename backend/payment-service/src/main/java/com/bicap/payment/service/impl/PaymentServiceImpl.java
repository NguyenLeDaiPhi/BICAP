package com.bicap.payment.service.impl;

import com.bicap.payment.dto.CreatePaymentRequest;
import com.bicap.payment.dto.PaymentResponse;
import com.bicap.payment.entity.Payment;
import com.bicap.payment.event.PaymentCompletedEvent;
import com.bicap.payment.event.PaymentFailedEvent;
import com.bicap.payment.exception.ResourceNotFoundException;
import com.bicap.payment.repository.PaymentRepository;
import com.bicap.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        log.info("Creating payment for order: {}", request.getOrderId());

        String paymentCode = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .paymentCode(paymentCode)
                .orderId(request.getOrderId())
                .payerId(request.getPayerId())
                .payeeId(request.getPayeeId())
                .amount(request.getAmount())
                .depositAmount(request.getDepositAmount())
                .type(Payment.PaymentType.valueOf(request.getType()))
                .status(Payment.PaymentStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .description(request.getDescription())
                .build();

        Payment saved = paymentRepository.save(payment);
        log.info("Payment created with code: {}", paymentCode);

        return PaymentResponse.fromEntity(saved);
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "id", id));
        return PaymentResponse.fromEntity(payment);
    }

    @Override
    public PaymentResponse getPaymentByCode(String paymentCode) {
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "paymentCode", paymentCode));
        return PaymentResponse.fromEntity(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream()
                .map(PaymentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(Long id, String transactionId) {
        log.info("Processing payment: {}", id);

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "id", id));

        payment.setStatus(Payment.PaymentStatus.PROCESSING);
        payment.setTransactionId(transactionId);

        Payment updated = paymentRepository.save(payment);
        log.info("Payment processing: {}", id);

        return PaymentResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(Long id) {
        log.info("Confirming payment: {}", id);

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "id", id));

        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());

        Payment updated = paymentRepository.save(payment);
        log.info("Payment completed: {}", id);

        // Send Kafka event
        PaymentCompletedEvent event = PaymentCompletedEvent.builder()
                .paymentId(payment.getId())
                .paymentCode(payment.getPaymentCode())
                .orderId(payment.getOrderId())
                .amount(payment.getAmount())
                .timestamp(LocalDateTime.now().toString())
                .build();

        kafkaTemplate.send("payment-completed", event);
        log.info("PaymentCompleted event sent for payment: {}", payment.getPaymentCode());

        return PaymentResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public PaymentResponse failPayment(Long id, String reason) {
        log.info("Failing payment: {}", id);

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "id", id));

        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setGatewayResponse(reason);

        Payment updated = paymentRepository.save(payment);
        log.info("Payment failed: {}", id);

        // Send Kafka event
        PaymentFailedEvent event = PaymentFailedEvent.builder()
                .paymentId(payment.getId())
                .paymentCode(payment.getPaymentCode())
                .orderId(payment.getOrderId())
                .reason(reason)
                .timestamp(LocalDateTime.now().toString())
                .build();

        kafkaTemplate.send("payment-failed", event);
        log.info("PaymentFailed event sent for payment: {}", payment.getPaymentCode());

        return PaymentResponse.fromEntity(updated);
    }
}
