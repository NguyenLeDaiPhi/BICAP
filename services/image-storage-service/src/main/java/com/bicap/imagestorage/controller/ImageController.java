package com.bicap.imagestorage.controller;

import com.bicap.imagestorage.dto.ApiResponse;
import com.bicap.imagestorage.dto.ImageResponse;
import com.bicap.imagestorage.dto.ImageUploadRequest;
import com.bicap.imagestorage.service.ImageStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageStorageService imageStorageService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImageResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("category") String category,
            @RequestParam(value = "referenceId", required = false) String referenceId,
            @RequestParam(value = "uploadedBy", required = false) String uploadedBy,
            @RequestParam(value = "description", required = false) String description) {

        ImageUploadRequest request = ImageUploadRequest.builder()
                .category(category)
                .referenceId(referenceId)
                .uploadedBy(uploadedBy)
                .description(description)
                .build();

        ImageResponse response = imageStorageService.uploadImage(file, request);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImageResponse>> getImageById(@PathVariable Long id) {
        ImageResponse response = imageStorageService.getImageById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/filename/{storedFilename}")
    public ResponseEntity<ApiResponse<ImageResponse>> getImageByFilename(@PathVariable String storedFilename) {
        ImageResponse response = imageStorageService.getImageByStoredFilename(storedFilename);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/download/{storedFilename}")
    public ResponseEntity<byte[]> downloadImage(@PathVariable String storedFilename) {
        byte[] imageData = imageStorageService.downloadImage(storedFilename);
        ImageResponse metadata = imageStorageService.getImageByStoredFilename(storedFilename);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + metadata.getOriginalFilename() + "\"")
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .body(imageData);
    }

    @GetMapping("/reference/{referenceId}")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getImagesByReferenceId(@PathVariable String referenceId) {
        List<ImageResponse> responses = imageStorageService.getImagesByReferenceId(referenceId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getImagesByCategory(@PathVariable String category) {
        List<ImageResponse> responses = imageStorageService.getImagesByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/user/{uploadedBy}")
    public ResponseEntity<ApiResponse<List<ImageResponse>>> getImagesByUser(@PathVariable String uploadedBy) {
        List<ImageResponse> responses = imageStorageService.getImagesByUploadedBy(uploadedBy);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Boolean>> deleteImage(@PathVariable Long id) {
        boolean result = imageStorageService.deleteImage(id);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", result));
    }

    @DeleteMapping("/{id}/soft")
    public ResponseEntity<ApiResponse<Boolean>> softDeleteImage(@PathVariable Long id) {
        boolean result = imageStorageService.softDeleteImage(id);
        return ResponseEntity.ok(ApiResponse.success("Image marked as deleted", result));
    }

    @PatchMapping("/{id}/description")
    public ResponseEntity<ApiResponse<ImageResponse>> updateDescription(
            @PathVariable Long id,
            @RequestParam String description) {
        ImageResponse response = imageStorageService.updateImageDescription(id, description);
        return ResponseEntity.ok(ApiResponse.success("Description updated", response));
    }
}
