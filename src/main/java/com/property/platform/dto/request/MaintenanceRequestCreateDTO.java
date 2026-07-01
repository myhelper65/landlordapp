package com.property.platform.dto.request;

import com.property.platform.entity.MaintenanceRequest.RequestPriority;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestCreateDTO {
    private UUID propertyId;
    private UUID userId;
    private String title;
    private String description;
    private RequestPriority priority;

}