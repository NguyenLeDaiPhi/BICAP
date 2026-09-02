package com.bicap.imagestorage.service;

import com.bicap.imagestorage.dto.ImageResponse;
import com.bicap.imagestorage.dto.ImageUploadRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImageStorageService {

    ImageResponse uploadImage(MultipartFile file, ImageUploadRequest request);

    ImageResponse getImageById(Long id);

    ImageResponse getImageByStoredFilename(String storedFilename);

    byte[] downloadImage(String storedFilename);

    List<ImageResponse> getImagesByReferenceId(String referenceId);

    List<ImageResponse> getImagesByCategory(String category);

    List<ImageResponse> getImagesByUploadedBy(String uploadedBy);

    boolean deleteImage(Long id);

    boolean softDeleteImage(Long id);

    ImageResponse updateImageDescription(Long id, String description);
}
