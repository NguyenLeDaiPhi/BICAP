package com.example.farm_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "environment_metrics")
@Data
public class EnvironmentMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    // Liên kết với Mùa vụ (để biết thông số này của vụ nào)
    @ManyToOne
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farmId;

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = false)
    private ProductionBatch productionBatch;

    private Double temperature; // Nhiệt độ
    private Double humidity;    // Độ ẩm

    @Column(name = "ph_level")
    private Double phLevel;     // Độ pH đất/nước

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();


}