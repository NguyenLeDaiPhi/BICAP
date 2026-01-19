package com.bicap.farm_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "farming_processes")
@Data
public class FarmingProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "production_batch_id", nullable = false)
    private ProductionBatch productionBatch;

    @Column(nullable = false)
    private String processType; // Ví dụ: WATERING, FERTILIZING, HARVESTING

    private String description;

    private LocalDateTime performedDate = LocalDateTime.now();

    // --- BLOCKCHAIN FIELDS ---
    @Column(name = "tx_hash")
    private String txHash; // Lưu hash giao dịch blockchain để đối chứng

    private String status;
}