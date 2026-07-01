package com.property.platform.controller;

import com.property.platform.dto.response.DashboardSummaryDTO;
import com.property.platform.dto.response.TenantDashboardResponseDTO;
import com.property.platform.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // Mevcut Admin Metodu
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        DashboardSummaryDTO response = dashboardService.getSystemSummary();
        return ResponseEntity.ok(response);
    }

    // YENİ EKLENEN: Tenant (Kiracı) Metodu
    @PreAuthorize("hasAnyAuthority('TENANT', 'ROLE_TENANT')")
    @GetMapping("/tenant")
    public ResponseEntity<TenantDashboardResponseDTO> getTenantSummary() {
        TenantDashboardResponseDTO response = dashboardService.getTenantDashboardData();
        return ResponseEntity.ok(response);
    }
}