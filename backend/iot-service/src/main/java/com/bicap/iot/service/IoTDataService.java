package com.bicap.iot.service;

import com.bicap.iot.dto.IoTDataRequest;
import com.bicap.iot.dto.IoTDataResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface IoTDataService {
    IoTDataResponse receiveData(IoTDataRequest request);
    List<IoTDataResponse> getDataByFarm(Long farmId);
    List<IoTDataResponse> getDataBySeason(Long seasonId);
    List<IoTDataResponse> getDataByFarmAndPeriod(Long farmId, LocalDateTime start, LocalDateTime end);
    List<IoTDataResponse> getAlerts();
}
