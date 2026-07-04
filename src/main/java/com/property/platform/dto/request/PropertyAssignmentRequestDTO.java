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
    private UUID userId; // Now optional if creating a new tenant
    private UUID propertyId;
    private UserProperty.RelationshipType type; // OWNER, TENANT, PROPERTY_MANAGER, MAINTENANCE_TECH
    
    // New fields for creating a tenant on the fly
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
}