package com.property.platform.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {
    // Senin mevcut alanların
    private long totalCommunities;
    private long totalProperties;
    private long totalUsers;
    private long openMaintenanceRequests;
    private BigDecimal totalUnpaidAmount;

    // Arayüzdeki yeni kartlar ve istatistikler için eklenenler
    private BigDecimal totalRevenue;        // "Total Revenue" kartı için (Şimdilik 0 veya mock)
    private long highPriorityRequests;      // "3 high priority" yazısı için
    private int occupancyRate;              // "%94" doluluk oranı için
    private long availableUnits;            // "6 units available" yazısı için

    // Alt kısımdaki Maintenance Status çipleri için
    private long newRequests;
    private long assignedRequests;
    private long inProgressRequests;
}