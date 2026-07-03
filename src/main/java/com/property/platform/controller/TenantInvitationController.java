package com.property.platform.controller;

import com.property.platform.dto.request.TenantActivationRequestDTO;
import com.property.platform.dto.request.TenantInvitationRequestDTO;
import com.property.platform.dto.response.AuthResponseDTO;
import com.property.platform.service.TenantInvitationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
public class TenantInvitationController {

    private final TenantInvitationService tenantInvitationService;

    @PostMapping("/invite")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    public ResponseEntity<String> inviteTenant(@RequestBody TenantInvitationRequestDTO request) {
        tenantInvitationService.inviteTenant(request);
        return ResponseEntity.ok("Tenant invited successfully. An email has been sent.");
    }

    @GetMapping("/activate/{token}")
    public ResponseEntity<Map<String, String>> getInvitationDetails(@PathVariable String token) {
        return ResponseEntity.ok(tenantInvitationService.getInvitationDetails(token));
    }

    @PostMapping("/activate")
    public ResponseEntity<AuthResponseDTO> activateTenant(@RequestBody TenantActivationRequestDTO request) {
        return ResponseEntity.ok(tenantInvitationService.activateTenant(request));
    }
}
