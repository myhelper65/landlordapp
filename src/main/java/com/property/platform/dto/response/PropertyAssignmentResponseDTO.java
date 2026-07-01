package com.property.platform.dto.response;

import com.property.platform.entity.UserProperty.RelationshipType;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyAssignmentResponseDTO {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private UUID propertyId;
    private String unitNumber;
    private RelationshipType type;
}