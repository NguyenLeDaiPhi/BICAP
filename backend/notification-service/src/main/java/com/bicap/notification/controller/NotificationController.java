package com.bicap.notification.controller;

import com.bicap.notification.dto.CreateNotificationRequest;
import com.bicap.notification.dto.NotificationResponse;
import com.bicap.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Thông báo", description = "Quản lý thông báo")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/me")
    @Operation(summary = "Lấy danh sách thông báo của tôi", description = "Trả về danh sách thông báo của người dùng đang đăng nhập")
    public ResponseEntity<?> getMyNotifications(@RequestHeader("X-User-Id") Long userId) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/me/unread")
    @Operation(summary = "Lấy thông báo chưa đọc", description = "Trả về danh sách thông báo chưa đọc")
    public ResponseEntity<?> getUnreadNotifications(@RequestHeader("X-User-Id") Long userId) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/me/unread/count")
    @Operation(summary = "Đếm thông báo chưa đọc", description = "Trả về số thông báo chưa đọc")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("X-User-Id") Long userId) {
        long count = notificationService.getUnreadCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Tạo thông báo mới", description = "Tạo một thông báo mới")
    public ResponseEntity<?> createNotification(@Valid @RequestBody CreateNotificationRequest request) {
        NotificationResponse notification = notificationService.createNotification(request);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Đánh dấu đã đọc", description = "Đánh dấu thông báo là đã đọc")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        NotificationResponse notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/me/read-all")
    @Operation(summary = "Đánh dấu tất cả đã đọc", description = "Đánh dấu tất cả thông báo là đã đọc")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("X-User-Id") Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu tất cả thông báo là đã đọc"));
    }
}
