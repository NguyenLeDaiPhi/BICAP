package com.bicap.farm_production.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bicap.farm_production.entity.FarmingSeason;
import com.bicap.farm_production.entity.SeasonStatus;
import com.bicap.farm_production.repository.FarmingSeasonRepository;

@Service
public class FarmingSeasonService {

    @Autowired
    private FarmingSeasonRepository repository;

    @Autowired
    private BlockchainProducer blockchainProducer;

    @Transactional
    public FarmingSeason createSeason(FarmingSeason season) {
        // 1. Lưu trạng thái ban đầu
        season.setStatus(SeasonStatus.PLANNING);
        FarmingSeason savedSeason = repository.save(season);

        // 2. Tính toán Hash dữ liệu (Ví dụ: ID + Name + FarmID)
        String rawData = savedSeason.getId() + savedSeason.getName() + savedSeason.getFarmId();
        String dataHash = calculateSHA256(rawData);

        // 3. Cập nhật Hash và trạng thái chờ Blockchain
        savedSeason.setDataHash(dataHash);
        savedSeason.setStatus(SeasonStatus.PENDING_BLOCKCHAIN);
        repository.save(savedSeason);

        // 4. Gửi sang RabbitMQ
        blockchainProducer.sendToBlockchain(savedSeason.getId().toString(), dataHash);

        return savedSeason;
    }

    private String calculateSHA256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error calculating hash", e);
        }
    }
    
    public List<FarmingSeason> getAllSeasons() {
        return repository.findAll();
    }
}