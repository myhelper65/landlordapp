package com.property.platform.dto.response;

import com.property.platform.entity.Announcement.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementResponseDTO {
    private UUID id;
    private UUID communityId;
    private String communityName;
    private UUID propertyId;
    private String propertyName;
    private String title;
    private String content;
    private AnnouncementCategory category;
    private AnnouncementPriority priority;
    private AnnouncementStatus status;
    private Instant publishDate;
    private Instant expirationDate;
    private Instant createdAt;
    private String createdBy;
    private boolean isRead; // For tenant UI
}