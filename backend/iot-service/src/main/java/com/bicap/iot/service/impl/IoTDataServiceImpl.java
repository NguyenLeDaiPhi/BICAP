package com.bicap.iot.service.impl;

import com.bicap.iot.dto.IoTDataRequest;
import com.bicap.iot.dto.IoTDataResponse;
import com.bicap.iot.entity.IoTData;
import com.bicap.iot.entity.IoTThreshold;
import com.bicap.iot.event.IoTThresholdExceededEvent;
import com.bicap.iot.repository.IoTDataRepository;
import com.bicap.iot.repository.IoTThresholdRepository;
import com.bicap.iot.service.IoTDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IoTDataServiceImpl implements IoTDataService {

    private final IoTDataRepository iotDataRepository;
    private final IoTThresholdRepository iotThresholdRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${iot.thresholds.temperature-min:15}")
    private BigDecimal defaultTempMin;

    @Value("${iot.thresholds.temperature-max:40}")
    private BigDecimal defaultTempMax;

    @Value("${iot.thresholds.humidity-min:30}")
    private BigDecimal defaultHumidityMin;

    @Value("${iot.thresholds.humidity-max:95}")
    private BigDecimal defaultHumidityMax;

    @Value("${iot.thresholds.ph-min:5.0}")
    private BigDecimal defaultPhMin;

    @Value("${iot.thresholds.ph-max:9.0}")
    private BigDecimal defaultPhMax;

    @Override
    @Transactional
    public IoTDataResponse receiveData(IoTDataRequest request) {
        log.info("Receiving IoT data from farm: {}", request.getFarmId());

        IoTData iotData = IoTData.builder()
                .farmId(request.getFarmId())
                .seasonId(request.getSeasonId())
                .deviceId(request.getDeviceId())
                .temperature(request.getTemperature())
                .humidity(request.getHumidity())
                .ph(request.getPh())
                .lightIntensity(request.getLightIntensity())
                .soilMoisture(request.getSoilMoisture())
                .timestamp(LocalDateTime.now())
                .isAlert(false)
                .build();

        // Check thresholds
        List<String> alerts = checkThresholds(request.getFarmId(), request);
        if (!alerts.isEmpty()) {
            iotData.setIsAlert(true);
            iotData.setAlertMessage(String.join("; ", alerts));

            // Send Kafka event
            IoTThresholdExceededEvent event = IoTThresholdExceededEvent.builder()
                    .farmId(request.getFarmId())
                    .seasonId(request.getSeasonId())
                    .temperature(request.getTemperature())
                    .humidity(request.getHumidity())
                    .ph(request.getPh())
                    .alerts(alerts)
                    .timestamp(LocalDateTime.now().toString())
                    .build();

            kafkaTemplate.send("iot-threshold-exceeded", event);
            log.info("IoTThresholdExceeded event sent for farm: {}", request.getFarmId());
        }

        IoTData saved = iotDataRepository.save(iotData);
        log.info("IoT data saved with id: {}", saved.getId());

        return IoTDataResponse.fromEntity(saved);
    }

    private List<String> checkThresholds(Long farmId, IoTDataRequest request) {
        List<String> alerts = new ArrayList<>();

        IoTThreshold threshold = iotThresholdRepository.findByFarmId(farmId)
                .orElse(createDefaultThreshold());

        if (request.getTemperature() != null) {
            if (request.getTemperature().compareTo(threshold.getTemperatureMin()) < 0) {
                alerts.add("Nhiệt độ quá thấp: " + request.getTemperature() + "°C");
            }
            if (request.getTemperature().compareTo(threshold.getTemperatureMax()) > 0) {
                alerts.add("Nhiệt độ quá cao: " + request.getTemperature() + "°C");
            }
        }

        if (request.getHumidity() != null) {
            if (request.getHumidity().compareTo(threshold.getHumidityMin()) < 0) {
                alerts.add("Độ ẩm quá thấp: " + request.getHumidity() + "%");
            }
            if (request.getHumidity().compareTo(threshold.getHumidityMax()) > 0) {
                alerts.add("Độ ẩm quá cao: " + request.getHumidity() + "%");
            }
        }

        if (request.getPh() != null) {
            if (request.getPh().compareTo(threshold.getPhMin()) < 0) {
                alerts.add("pH quá thấp: " + request.getPh());
            }
            if (request.getPh().compareTo(threshold.getPhMax()) > 0) {
                alerts.add("pH quá cao: " + request.getPh());
            }
        }

        return alerts;
    }

    private IoTThreshold createDefaultThreshold() {
        return IoTThreshold.builder()
                .temperatureMin(defaultTempMin)
                .temperatureMax(defaultTempMax)
                .humidityMin(defaultHumidityMin)
                .humidityMax(defaultHumidityMax)
                .phMin(defaultPhMin)
                .phMax(defaultPhMax)
                .build();
    }

    @Override
    public List<IoTDataResponse> getDataByFarm(Long farmId) {
        log.info("Getting IoT data for farm: {}", farmId);
        return iotDataRepository.findByFarmIdOrderByTimestampDesc(farmId).stream()
                .map(IoTDataResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<IoTDataResponse> getDataBySeason(Long seasonId) {
        log.info("Getting IoT data for season: {}", seasonId);
        return iotDataRepository.findBySeasonIdOrderByTimestampDesc(seasonId).stream()
                .map(IoTDataResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<IoTDataResponse> getDataByFarmAndPeriod(Long farmId, LocalDateTime start, LocalDateTime end) {
        log.info("Getting IoT data for farm {} from {} to {}", farmId, start, end);
        return iotDataRepository.findByFarmIdAndTimestampBetween(farmId, start, end).stream()
                .map(IoTDataResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<IoTDataResponse> getAlerts() {
        log.info("Getting all IoT alerts");
        return iotDataRepository.findByIsAlertTrueOrderByTimestampDesc().stream()
                .map(IoTDataResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
