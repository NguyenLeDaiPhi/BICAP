package com.bicap.imagestorage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageUploadRequest {

    @NotBlank(message = "Category is required")
    private String category;

    private String referenceId;

    private String uploadedBy;

    private String description;
}
