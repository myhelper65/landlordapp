package com.property.platform.dto.response;

import com.property.platform.entity.Property.PropertyType;
import com.property.platform.entity.Property.PropertyStatus;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyResponseDTO {
    private UUID id;
    private UUID communityId;
    private String communityName;
    private String unitNumber;
    private PropertyType propertyType;
    private PropertyStatus status;
    private String notes;
    
    // YENİ EKLENEN ALANLAR:
    private String tenantName; // Eğer mülk doluysa aktif kiracının adı soyadı
    private List<DocumentDTO> documents; // Mülke ait belgelerin listesi


}