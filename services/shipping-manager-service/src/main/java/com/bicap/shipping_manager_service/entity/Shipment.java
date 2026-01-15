package com.bicap.shipping_manager_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "shipments")
public class Shipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID đơn hàng từ Farm Service (để liên kết dữ liệu)
    private Long orderId; 

    // Tài xế phụ trách
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    // Xe vận chuyển
    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private String fromLocation; // Địa chỉ lấy hàng (Farm)
    private String toLocation;   // Địa chỉ giao hàng (Retailer)

    // Trạng thái vận đơn (Enum)
    @Enumerated(EnumType.STRING)
    private ShipmentStatus status; 

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Lưu hash giao dịch blockchain để tra cứu sau này
    private String blockchainTxHash; 
    
    // Tự động cập nhật thời gian
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}