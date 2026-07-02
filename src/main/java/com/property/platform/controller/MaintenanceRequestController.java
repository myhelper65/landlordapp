package com.property.platform.controller;

import com.property.platform.service.MaintenanceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MaintenanceRequestController {

    private final MaintenanceRequestService maintenanceService;

    // ==========================================
    // 1. KİRACI (TENANT) İŞLEMLERİ
    // ==========================================

//    // Yeni Talep Oluşturma (Resim Destekli)
//    @PreAuthorize("hasAnyRole('TENANT', 'OWNER', 'ADMIN', 'SUPER_ADMIN')")
//    @PostMapping(value = "/api/v1/tenant/repair-requests", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public ResponseEntity<Map<String, Object>> createRequest(
//            @RequestParam("title") String title,
//            @RequestParam("description") String description,
//            @RequestParam("priority") String priority,
//            @RequestParam(value = "file", required = false) MultipartFile file) {
//
//        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//        Map<String, Object> response = maintenanceService.createRequest(title, description, priority, file, email);
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }

    // Yeni Talep Oluşturma
    @PreAuthorize("hasAnyRole('TENANT', 'OWNER', 'ADMIN', 'SUPER_ADMIN')")
    @PostMapping(value = "/api/v1/tenant/repair-requests", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> createRequest(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("priority") String priority,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "propertyId", required = false) UUID propertyId) { // YENİ EKLENDİ

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // propertyId'yi servise gönder
        Map<String, Object> response = maintenanceService.createRequest(title, description, priority, file, email, propertyId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Kiracının Kendi Taleplerini Listelemesi
    @PreAuthorize("hasAnyRole('TENANT', 'OWNER', 'ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/api/v1/tenant/repair-requests")
    public ResponseEntity<List<Map<String, Object>>> getMyRequests() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(maintenanceService.getMyRequests(email));
    }

    // Kiracının Kendi Talebini Silmesi
    @PreAuthorize("hasAnyRole('TENANT', 'OWNER', 'ADMIN', 'SUPER_ADMIN')")
    @DeleteMapping("/api/v1/tenant/repair-requests/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable UUID id) {
        maintenanceService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    // Kiracının Kendi Talebini Güncellemesi (Edit)
    @PreAuthorize("hasAnyRole('TENANT', 'OWNER', 'ADMIN', 'SUPER_ADMIN')")
    @PutMapping(value = "/api/v1/tenant/repair-requests/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> updateTenantRequest(
            @PathVariable UUID id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("priority") String priority,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = maintenanceService.updateTenantRequest(id, title, description, priority, file, email);
        return ResponseEntity.ok(response);
    }


    // ==========================================
    // 2. YÖNETİCİ (ADMIN) İŞLEMLERİ
    // ==========================================

    // Adminin Tüm Talepleri Tabloda Görmesi
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @GetMapping("/api/v1/admin/repair-requests")
    public ResponseEntity<List<Map<String, Object>>> getAllRequestsForAdmin() {
        return ResponseEntity.ok(maintenanceService.getAllRequests());
    }

    // Adminin İş Emri Durumunu (OPEN -> IN_PROGRESS) Güncellemesi
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    @PutMapping("/api/v1/admin/repair-requests/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> payload) {

        Map<String, Object> response = maintenanceService.updateStatus(id, payload.get("status"));
        return ResponseEntity.ok(response);
    }


}