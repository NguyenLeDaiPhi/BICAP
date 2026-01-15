package com.bicap.shipping_manager_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String licensePlate; // Biển số
    private Double capacity;     // Tải trọng
    private String type;         // Loại xe (Lạnh, Thường)
    private Boolean isAvailable; // Trạng thái sẵn sàng
}