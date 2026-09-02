package com.bicap.iot.repository;

import com.bicap.iot.entity.IoTThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IoTThresholdRepository extends JpaRepository<IoTThreshold, Long> {
    Optional<IoTThreshold> findByFarmId(Long farmId);
}
