package com.example.logistic_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipment_reports")
@Data
public class ShipmentReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shipment_id")
    private Long shipmentId;

    @Column(name = "driver_id")
    private Long driverId;

    @Column(name = "report_type")
    private String reportType; // INCIDENT (Sự cố), DELAY (Trễ), OTHER

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}