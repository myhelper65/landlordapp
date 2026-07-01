package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "announcements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Announcement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id") // Optional: if targeting a specific building/unit
    private Property property;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementStatus status;

    @Column(name = "publish_date")
    private Instant publishDate;

    @Column(name = "expiration_date")
    private Instant expirationDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public enum AnnouncementPriority {
        LOW, NORMAL, HIGH, CRITICAL
    }

    public enum AnnouncementCategory {
        GENERAL, MAINTENANCE, EMERGENCY, EVENT, REMINDER
    }

    public enum AnnouncementStatus {
        DRAFT, SCHEDULED, PUBLISHED, ARCHIVED
    }
}