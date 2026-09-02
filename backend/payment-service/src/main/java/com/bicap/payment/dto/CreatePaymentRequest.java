package com.bicap.payment.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {
    
    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "ID người thanh toán không được để trống")
    private Long payerId;

    @NotNull(message = "ID người nhận không được để trống")
    private Long payeeId;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000", message = "Số tiền tối thiểu là 1000 VNĐ")
    private BigDecimal amount;

    private BigDecimal depositAmount;

    @NotNull(message = "Loại thanh toán không được để trống")
    private String type;

    private String paymentMethod;

    private String description;
}
