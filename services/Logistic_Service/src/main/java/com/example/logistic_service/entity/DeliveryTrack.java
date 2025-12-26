package com.example.logistic_service.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_tracks")
@Data
public class DeliveryTrack {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shipment_id")
    private Long shipmentId;

    private String location; // Tọa độ hoặc tên địa điểm hiện tại

    @Column(name = "tracked_at")
    private LocalDateTime trackedAt = LocalDateTime.now();
}