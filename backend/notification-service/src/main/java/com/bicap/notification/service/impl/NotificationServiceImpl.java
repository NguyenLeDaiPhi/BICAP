package com.bicap.notification.service.impl;

import com.bicap.notification.dto.CreateNotificationRequest;
import com.bicap.notification.dto.NotificationResponse;
import com.bicap.notification.entity.Notification;
import com.bicap.notification.exception.ResourceNotFoundException;
import com.bicap.notification.repository.NotificationRepository;
import com.bicap.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public NotificationResponse createNotification(CreateNotificationRequest request) {
        log.info("Creating notification for user: {}", request.getUserId());

        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(Notification.NotificationType.valueOf(request.getType()))
                .title(request.getTitle())
                .content(request.getContent())
                .link(request.getLink())
                .relatedId(request.getRelatedId())
                .channel(request.getChannel() != null 
                        ? Notification.NotificationChannel.valueOf(request.getChannel()) 
                        : Notification.NotificationChannel.IN_APP)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created with id: {}", saved.getId());

        return NotificationResponse.fromEntity(saved);
    }

    @Override
    public List<NotificationResponse> getUserNotifications(Long userId) {
        log.info("Getting notifications for user: {}", userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        log.info("Getting unread notifications for user: {}", userId);
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false).stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long id) {
        log.info("Marking notification as read: {}", id);
        
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo", "id", id));

        notification.setIsRead(true);
        Notification updated = notificationRepository.save(notification);

        return NotificationResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void sendSystemNotification(Long userId, String title, String content) {
        log.info("Sending system notification to user: {}", userId);
        
        Notification notification = Notification.builder()
                .userId(userId)
                .type(Notification.NotificationType.SYSTEM)
                .title(title)
                .content(content)
                .isRead(false)
                .channel(Notification.NotificationChannel.IN_APP)
                .build();

        notificationRepository.save(notification);
    }
}
