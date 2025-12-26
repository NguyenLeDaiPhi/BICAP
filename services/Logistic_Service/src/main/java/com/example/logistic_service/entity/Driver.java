package com.example.logistic_service.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "drivers")
@Data
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;

    @Column(name = "vehicle_plate")
    private String vehiclePlate; // Biển số xe

    // --- CÁC CỘT MỚI SỬA ĐỔI ---

    @Column(name = "vehicle_type")
    private String vehicleType; // [NEW] Loại xe (Xe tải 1 tấn, Container...)
}