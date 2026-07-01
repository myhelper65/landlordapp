package com.property.platform.dto.request;

import com.property.platform.entity.Property.PropertyType;
import com.property.platform.entity.Property.PropertyStatus;
import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyRequestDTO {
    private UUID communityId; // Hangi siteye ait?
    private String unitNumber;
    private PropertyType propertyType;
    private PropertyStatus status;
    private String notes;
}