package com.property.platform.dto.request;

import com.property.platform.entity.Announcement.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementRequestDTO {
    private UUID communityId;
    private UUID propertyId;
    private String title;
    private String content;
    private AnnouncementCategory category;
    private AnnouncementPriority priority;
    private AnnouncementStatus status;
    private Instant publishDate;
    private Instant expirationDate;
}