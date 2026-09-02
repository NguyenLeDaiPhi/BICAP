package com.bicap.imagestorage.service.impl;

import com.bicap.imagestorage.dto.ImageResponse;
import com.bicap.imagestorage.dto.ImageUploadRequest;
import com.bicap.imagestorage.entity.ImageMetadata;
import com.bicap.imagestorage.repository.ImageMetadataRepository;
import com.bicap.imagestorage.service.ImageStorageService;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageStorageServiceImpl implements ImageStorageService {

    private final MinioClient minioClient;
    private final ImageMetadataRepository imageMetadataRepository;

    @Value("${minio.bucket-name:bicap-product-images}")
    private String bucketName;

    @Value("${minio.presigned-url-expiry:3600}")
    private int presignedUrlExpiry;

    @Override
    @Transactional
    public ImageResponse uploadImage(MultipartFile file, ImageUploadRequest request) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String storedFilename = UUID.randomUUID().toString() + extension;

            boolean bucketExists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!bucketExists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(storedFilename)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            String filePath = bucketName + "/" + storedFilename;

            ImageMetadata metadata = ImageMetadata.builder()
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .filePath(filePath)
                    .bucketName(bucketName)
                    .category(request.getCategory())
                    .referenceId(request.getReferenceId())
                    .uploadedBy(request.getUploadedBy())
                    .description(request.getDescription())
                    .isActive(true)
                    .build();

            ImageMetadata saved = imageMetadataRepository.save(metadata);

            return toResponse(saved);

        } catch (Exception e) {
            log.error("Failed to upload image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    @Override
    public ImageResponse getImageById(Long id) {
        ImageMetadata metadata = imageMetadataRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));
        return toResponse(metadata);
    }

    @Override
    public ImageResponse getImageByStoredFilename(String storedFilename) {
        ImageMetadata metadata = imageMetadataRepository.findByStoredFilename(storedFilename)
                .orElseThrow(() -> new RuntimeException("Image not found: " + storedFilename));
        if (!metadata.getIsActive()) {
            throw new RuntimeException("Image has been deleted");
        }
        return toResponse(metadata);
    }

    @Override
    public byte[] downloadImage(String storedFilename) {
        try {
            ImageMetadata metadata = imageMetadataRepository.findByStoredFilename(storedFilename)
                    .orElseThrow(() -> new RuntimeException("Image not found: " + storedFilename));

            if (!metadata.getIsActive()) {
                throw new RuntimeException("Image has been deleted");
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(metadata.getBucketName())
                            .object(metadata.getStoredFilename())
                            .build()
            ).transferTo(outputStream);

            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("Failed to download image: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to download image: " + e.getMessage());
        }
    }

    @Override
    public List<ImageResponse> getImagesByReferenceId(String referenceId) {
        return imageMetadataRepository.findByReferenceIdAndIsActiveTrue(referenceId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImageResponse> getImagesByCategory(String category) {
        return imageMetadataRepository.findByCategoryAndIsActiveTrue(category)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImageResponse> getImagesByUploadedBy(String uploadedBy) {
        return imageMetadataRepository.findByUploadedByAndIsActiveTrue(uploadedBy)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public boolean deleteImage(Long id) {
        ImageMetadata metadata = imageMetadataRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));

        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(metadata.getBucketName())
                            .object(metadata.getStoredFilename())
                            .build()
            );
            imageMetadataRepository.delete(metadata);
            return true;
        } catch (Exception e) {
            log.error("Failed to delete image from MinIO: {}", e.getMessage());
            imageMetadataRepository.delete(metadata);
            return true;
        }
    }

    @Override
    @Transactional
    public boolean softDeleteImage(Long id) {
        ImageMetadata metadata = imageMetadataRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));

        metadata.setIsActive(false);
        imageMetadataRepository.save(metadata);
        return true;
    }

    @Override
    @Transactional
    public ImageResponse updateImageDescription(Long id, String description) {
        ImageMetadata metadata = imageMetadataRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + id));

        metadata.setDescription(description);
        ImageMetadata updated = imageMetadataRepository.save(metadata);
        return toResponse(updated);
    }

    private ImageResponse toResponse(ImageMetadata metadata) {
        String downloadUrl = generatePresignedUrl(metadata.getBucketName(), metadata.getStoredFilename());

        return ImageResponse.builder()
                .id(metadata.getId())
                .originalFilename(metadata.getOriginalFilename())
                .storedFilename(metadata.getStoredFilename())
                .contentType(metadata.getContentType())
                .fileSize(metadata.getFileSize())
                .filePath(metadata.getFilePath())
                .downloadUrl(downloadUrl)
                .category(metadata.getCategory())
                .referenceId(metadata.getReferenceId())
                .uploadedBy(metadata.getUploadedBy())
                .description(metadata.getDescription())
                .createdAt(metadata.getCreatedAt())
                .build();
    }

    private String generatePresignedUrl(String bucket, String object) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(object)
                            .expiry(presignedUrlExpiry)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to generate presigned URL: {}", e.getMessage());
            return null;
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return ".jpg";
        }
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? ".jpg" : filename.substring(dotIndex);
    }
}
