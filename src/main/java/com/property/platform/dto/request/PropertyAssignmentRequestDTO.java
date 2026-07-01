package com.property.platform.dto.request;


import com.property.platform.entity.UserProperty;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyAssignmentRequestDTO {
    private UUID userId;
    private UUID propertyId;
    private UserProperty.RelationshipType type; // OWNER, TENANT, PROPERTY_MANAGER, MAINTENANCE_TECH
}