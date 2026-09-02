package com.bicap.payment.repository;

import com.bicap.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentCode(String paymentCode);
    List<Payment> findByOrderId(Long orderId);
    List<Payment> findByPayerId(Long payerId);
    List<Payment> findByPayeeId(Long payeeId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
}
