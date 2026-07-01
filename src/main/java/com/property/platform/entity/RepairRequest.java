package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "repair_requests") // Tablo adını da repair_requests yaptık
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepairRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(unique = true, updatable = false)
    private String workOrderNumber;

    public enum RequestPriority {
        LOW, MEDIUM, HIGH, URGENT
    }

    public enum RequestStatus {
        OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, CANCELLED
    }
}