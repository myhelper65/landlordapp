package com.property.platform.dto.response;

import com.property.platform.dto.request.MaintenanceRequestSummaryDTO;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantDashboardResponseDTO {
    private String firstName;
    private String communityName;
    private String propertyName;
    private BigDecimal nextPaymentDue;
    private LocalDate dueDate;
    private int openRequests;
    private UUID currentInvoiceId;
    // New field to pass dynamic maintenance data to the frontend
    private List<MaintenanceRequestSummaryDTO> recentMaintenanceRequests;
}