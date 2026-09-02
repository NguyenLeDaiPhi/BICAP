package com.bicap.iot.repository;

import com.bicap.iot.entity.IoTData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IoTDataRepository extends JpaRepository<IoTData, Long> {
    List<IoTData> findByFarmIdOrderByTimestampDesc(Long farmId);
    List<IoTData> findBySeasonIdOrderByTimestampDesc(Long seasonId);
    
    @Query("SELECT i FROM IoTData i WHERE i.farmId = ?1 AND i.timestamp BETWEEN ?2 AND ?3 ORDER BY i.timestamp DESC")
    List<IoTData> findByFarmIdAndTimestampBetween(Long farmId, LocalDateTime start, LocalDateTime end);
    
    List<IoTData> findByIsAlertTrueOrderByTimestampDesc();
}
