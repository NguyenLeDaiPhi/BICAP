package com.bicap.notification.service;

import com.bicap.notification.dto.CreateNotificationRequest;
import com.bicap.notification.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse createNotification(CreateNotificationRequest request);
    List<NotificationResponse> getUserNotifications(Long userId);
    List<NotificationResponse> getUnreadNotifications(Long userId);
    long getUnreadCount(Long userId);
    NotificationResponse markAsRead(Long id);
    void markAllAsRead(Long userId);
    void sendSystemNotification(Long userId, String title, String content);
}
