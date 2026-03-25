package com.insuretrack.notification.service;

import com.insuretrack.common.enums.NotificationCategory;
import com.insuretrack.common.enums.NotificationStatus;
import com.insuretrack.notification.dto.NotificationResponseDTO;
import com.insuretrack.notification.entity.Notification;
import com.insuretrack.notification.repository.NotificationRepository;
import com.insuretrack.user.entity.User;
import com.insuretrack.user.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public NotificationResponseDTO createNotification(
            Long userId,
            String message,
            NotificationCategory category) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .category(category)
                .status(NotificationStatus.UNREAD)
                .createdDate(LocalDateTime.now())
                .build();

        // Using saveAndFlush ensures the DB constraints (like VARCHAR length)
        // are checked before the method returns.
        Notification savedNotification = notificationRepository.saveAndFlush(notification);

        return mapToResponse(savedNotification);
    }

    @Override
    public List<NotificationResponseDTO> getUserNotifications(Long userId) {
        // The logs confirm this is being called with ID 1
        List<Notification> notifications = notificationRepository.findByUser_UserId(userId);

        return notifications.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public NotificationResponseDTO markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setStatus(NotificationStatus.READ);
        return mapToResponse(notificationRepository.saveAndFlush(notification));
    }

    @Override
    @Transactional
    public NotificationResponseDTO dismissNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setStatus(NotificationStatus.DISMISSED);
        return mapToResponse(notificationRepository.saveAndFlush(notification));
    }

    private NotificationResponseDTO mapToResponse(Notification notification) {
        if (notification == null) return null;

        return NotificationResponseDTO.builder()
                .notificationId(notification.getNotificationId())
                // Ensure we get the ID from the proxy object safely
                .userId(notification.getUser() != null ? notification.getUser().getUserId() : null)
                .message(notification.getMessage())
                .category(notification.getCategory())
                .status(notification.getStatus())
                .createdDate(notification.getCreatedDate())
                .build();
    }
}