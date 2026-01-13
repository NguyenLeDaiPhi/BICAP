package com.example.admin_service.client;

import com.example.admin_service.dto.FarmResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "farm-service", url = "http://localhost:8081")
public interface FarmServiceClient {

    @GetMapping("/api/farm-features")
    List<FarmResponseDTO> getAllFarms();
    //Lấy số lượng farm
    @GetMapping("/api/farm-features/count")
    Long countTotalFarms();

    //Lấy log (Bạn cần tạo FarmLogDTO bên Admin Service để hứng dữ liệu)
    @GetMapping("/api/farm-features/{farmId}/logs")
    List<Object> getFarmLogs(@PathVariable("farmId") Long farmId);
}