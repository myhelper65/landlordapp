package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProperty extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RelationshipType type;

    @Column(name = "lease_start_date")
    private java.time.LocalDate leaseStartDate;

    @Column(name = "lease_end_date")
    private java.time.LocalDate leaseEndDate;

    @Column(name = "monthly_rent")
    private java.math.BigDecimal monthlyRent;

    @Column(name = "security_deposit")
    private java.math.BigDecimal securityDeposit;

    // RelationshipType ENUM'ı burada tanımlı!
    public enum RelationshipType {
        OWNER, TENANT, PROPERTY_MANAGER, MAINTENANCE_TECH
    }
}