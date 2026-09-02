package com.bicap.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateNotificationRequest {
    
    @NotNull(message = "ID người dùng không được để trống")
    private Long userId;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String type;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String content;

    private String link;

    private String relatedId;

    private String channel;
}
