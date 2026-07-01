package com.property.platform.controller;

import com.property.platform.dto.response.DocumentDTO;
import com.property.platform.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenant")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    // KİRACININ KENDİ MÜLKÜNE AİT BELGELERİ GETİRİR
    @PreAuthorize("hasRole('TENANT')")
    @GetMapping("/documents")
    public ResponseEntity<List<DocumentDTO>> getMyDocuments() {
        return ResponseEntity.ok(tenantService.getMyLeaseDocuments());
    }
}