package com.example.logistic_service.entity;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "shipments")
@Data
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id")
    private Long orderId; // ID đơn hàng gốc (từ Retailer/Farm service)

    @Column(name = "driver_id")
    private Long driverId;

    private String status; // PENDING, PICKED_UP, DELIVERED, CANCELLED

    @Column(name = "expected_delivery")
    private LocalDate expectedDelivery;

    @Column(name = "actual_delivery")
    private LocalDate actualDelivery;

    // --- CÁC CỘT MỚI SỬA ĐỔI (NEW COLUMNS) ---

    @Column(name = "farm_id")
    private Long farmId; // [NEW] Để biết lấy hàng ở đâu & Gửi thông báo cho Farm

    @Column(name = "retailer_id")
    private Long retailerId; // [NEW] Để biết giao cho ai & Gửi thông báo cho Retailer

    @Column(name = "pickup_address", columnDefinition = "TEXT")
    private String pickupAddress; // [NEW] Địa chỉ lấy hàng (Hiển thị cho tài xế)

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress; // [NEW] Địa chỉ giao hàng

    @Column(name = "current_lat_long")
    private String currentLatLong; // [NEW] Vị trí hiện tại (Ví dụ: "10.762,106.682")
}