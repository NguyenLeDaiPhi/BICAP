package com.bicap.shipping_manager_service.repository;

import com.bicap.shipping_manager_service.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    // Tìm xe theo biển số nếu cần
    boolean existsByLicensePlate(String licensePlate);
}