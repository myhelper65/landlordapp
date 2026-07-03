package com.property.platform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantInvitationRequestDTO {
    // Personal Info
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    
    // Lease Info
    private UUID propertyId;
    private LocalDate leaseStartDate;
    private LocalDate leaseEndDate;
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;
}
