package com.property.platform.dto.response;

import com.property.platform.entity.MaintenanceRequest.RequestPriority;
import com.property.platform.entity.MaintenanceRequest.RequestStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceResponseDTO {
    private UUID requestId;
    private UUID propertyId;
    private String unitNumber;
    private UUID userId;
    private String userEmail;
    private String title;
    private String description;
    private RequestPriority priority;
    private RequestStatus status;
    private Instant createdAt;
    private Instant resolvedAt;
    private String workOrderNumber;
    private String photoUrl;
}