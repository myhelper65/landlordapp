package com.property.platform.controller;

import com.property.platform.dto.request.AnnouncementRequestDTO;
import com.property.platform.dto.response.AnnouncementResponseDTO;
import com.property.platform.entity.Announcement.AnnouncementStatus;
import com.property.platform.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @GetMapping("/community/{communityId}")
    public ResponseEntity<Page<AnnouncementResponseDTO>> getAllForAdmin(
            @PathVariable UUID communityId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AnnouncementStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(announcementService.getAdminAnnouncements(communityId, search, status, PageRequest.of(page, size, sort)));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponseDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(announcementService.getById(id));
    }

    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('PROPERTY_MANAGER')")
    @PostMapping
    public ResponseEntity<AnnouncementResponseDTO> create(@RequestBody AnnouncementRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.createAnnouncement(request));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<AnnouncementResponseDTO> update(@PathVariable UUID id, @RequestBody AnnouncementRequestDTO request) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, request));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @PatchMapping("/{id}/publish")
    public ResponseEntity<AnnouncementResponseDTO> publish(@PathVariable UUID id) {
        return ResponseEntity.ok(announcementService.updateStatus(id, AnnouncementStatus.PUBLISHED));
    }

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @PatchMapping("/{id}/archive")
    public ResponseEntity<AnnouncementResponseDTO> archive(@PathVariable UUID id) {
        return ResponseEntity.ok(announcementService.updateStatus(id, AnnouncementStatus.ARCHIVED));
    }

    // ==========================================
    // TENANT ENDPOINTS (READ-ONLY)
    // ==========================================

    @PreAuthorize("hasAnyRole('TENANT', 'PROPERTY_OWNER')")
    @GetMapping("/tenant")
    public ResponseEntity<Page<AnnouncementResponseDTO>> getTenantAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(announcementService.getTenantAnnouncements(PageRequest.of(page, size)));
    }

    @PreAuthorize("hasAnyRole('TENANT', 'PROPERTY_OWNER')")
    @PatchMapping("/{id}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        announcementService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}