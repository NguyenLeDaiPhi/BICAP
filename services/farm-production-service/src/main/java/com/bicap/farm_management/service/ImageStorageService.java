package com.bicap.farm_management.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageStorageService {
    private final RestTemplate restTemplate;
    @Value("${IMAGE_STORAGE_SERVICE_URL:http://localhost:8086}")
    private String imageStorageServiceUrl;
    @Value("${IMAGE_PUBLIC_BASE_URL:http://localhost:8000}")
    private String publicBaseUrl;

    public String uploadImage(MultipartFile file, Long productId, Long farmId, String authToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        if (authToken != null && !authToken.isBlank()) headers.setBearerAuth(authToken);
        var body = new LinkedMultiValueMap<String, Object>();
        body.add("file", file.getResource());
        body.add("category", "PRODUCT");
        body.add("referenceId", "farm-product-" + productId);
        body.add("uploadedBy", "farm-" + farmId);
        try {
            var response = restTemplate.postForEntity(imageStorageServiceUrl + "/api/v1/images/upload", new HttpEntity<>(body, headers), Map.class);
            if (response.getBody() != null && response.getBody().get("data") instanceof Map<?, ?> data && data.get("storedFilename") instanceof String filename && filename.matches("[A-Za-z0-9_-]+\\.[A-Za-z0-9]+")) {
                return publicBaseUrl.replaceAll("/+$", "") + "/api/v1/images/download/" + filename;
            }
        } catch (org.springframework.web.client.RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Chưa tải được ảnh. Sản phẩm chưa được gửi duyệt, vui lòng thử lại.", exception);
        }
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Dịch vụ lưu ảnh trả về dữ liệu không hợp lệ.");
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getProductImages(Long productId) {
        var response = restTemplate.getForObject(imageStorageServiceUrl + "/api/v1/images/reference/farm-product-" + productId, Map.class);
        return response != null && response.get("data") instanceof List<?> list ? (List<Map<String, Object>>) list : List.of();
    }
}
