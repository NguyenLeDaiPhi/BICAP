package com.example.logistic_service.repository;

import com.example.logistic_service.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    // Tìm các chuyến hàng của một tài xế cụ thể
    List<Shipment> findByDriverId(Long driverId);

    // Tìm theo trạng thái (ví dụ: tìm đơn đang PENDING để gán xe)
    List<Shipment> findByStatus(String status);
}