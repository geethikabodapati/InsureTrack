package com.insuretrack.notification.dto;

import com.insuretrack.common.enums.NotificationCategory;
import com.insuretrack.common.enums.NotificationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data // or @Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponseDTO {
    private Long notificationId;
    private Long userId;
    private String message;
    private NotificationCategory category; // <--- Ensure this is here
    private NotificationStatus status;
    private LocalDateTime createdDate;
}