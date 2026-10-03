package com.bicap.farm_management.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "production_batches")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductionBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Farm farm;

    @Column(name = "batch_code",nullable = false)
    private String batchCode;

    @Column(name = "product_type")
    private String productType;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    // Tên mùa vụ (frontend gửi lên)
    @Column(name = "name")
    private String name;

    // Diện tích trồng (đơn vị: ha)
    @Column(name = "area")
    private Double area;

    // Sản lượng dự kiến (đơn vị: tấn)
    @Column(name = "quantity")
    private Double quantity;

    // Trạng thái: PLANNING, ACTIVE, HARVESTED
    private String status;

    // --- BLOCKCHAIN FIELDS ---
    @Column(name = "tx_hash")
    private String txHash; // Mã giao dịch tạo mùa vụ trên Blockchain

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}