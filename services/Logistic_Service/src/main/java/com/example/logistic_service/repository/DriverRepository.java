package com.example.logistic_service.repository;


import com.example.logistic_service.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Long> {
    // Tìm tài xế theo loại xe (để gợi ý cho đơn hàng lớn/nhỏ)
    List<Driver> findByVehicleType(String vehicleType);
}