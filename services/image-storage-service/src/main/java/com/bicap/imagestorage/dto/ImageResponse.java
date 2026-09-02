package com.bicap.imagestorage.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageResponse {
    private Long id;
    private String originalFilename;
    private String storedFilename;
    private String contentType;
    private Long fileSize;
    private String filePath;
    private String downloadUrl;
    private String category;
    private String referenceId;
    private String uploadedBy;
    private String description;
    private LocalDateTime createdAt;
}
