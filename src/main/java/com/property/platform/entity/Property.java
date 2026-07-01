package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property extends BaseEntity {

    @Column(name = "unit_number", nullable = false, length = 50)
    private String unitNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_type", nullable = false)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    public enum PropertyType {
        APARTMENT, TOWNHOUSE, SINGLE_FAMILY, COMMERCIAL
    }

    // INACTIVE buraya eklendi!
    public enum PropertyStatus {
        VACANT, OCCUPIED, MAINTENANCE, UNDER_CONSTRUCTION, INACTIVE, UNDER_MAINTENANCE
    }
}