package com.property.platform.service;

import com.property.platform.dto.request.AnnouncementRequestDTO;
import com.property.platform.dto.response.AnnouncementResponseDTO;
import com.property.platform.entity.*;
import com.property.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CommunityRepository communityRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final AnnouncementReadReceiptRepository readReceiptRepository;
    private final UserPropertyRepository userPropertyRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- ADMIN METHODS ---

    // EKSİK OLAN GET BY ID METODU EKLENDİ
    public AnnouncementResponseDTO getById(UUID id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        return mapToDTO(announcement, false);
    }

    // SAYFALAMA VE FİLTRELEME DESTEKLİ YENİ ADMIN LİSTELEME METODU
    public Page<AnnouncementResponseDTO> getAdminAnnouncements(UUID communityId, String search, Announcement.AnnouncementStatus status, Pageable pageable) {
        return announcementRepository.findByFiltersForAdmin(communityId, search, status, pageable)
                .map(a -> mapToDTO(a, false));
    }

    @Transactional
    public AnnouncementResponseDTO createAnnouncement(AnnouncementRequestDTO request) {
        Community community = communityRepository.findByIdAndIsDeletedFalse(request.getCommunityId())
                .orElseThrow(() -> new RuntimeException("Community not found"));

        Property property = null;
        if (request.getPropertyId() != null) {
            property = propertyRepository.findByIdAndIsDeletedFalse(request.getPropertyId())
                    .orElseThrow(() -> new RuntimeException("Property not found"));
        }

        Announcement announcement = Announcement.builder()
                .community(community)
                .property(property)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(request.getStatus())
                .publishDate(request.getPublishDate() != null ? request.getPublishDate() : Instant.now())
                .expirationDate(request.getExpirationDate())
                .isActive(true)
                .build();

//        announcement.setId(UUID.randomUUID());
//        announcement.setCreatedAt(Instant.now());
        
        return mapToDTO(announcementRepository.save(announcement), false);
    }

    @Transactional
    public AnnouncementResponseDTO updateAnnouncement(UUID id, AnnouncementRequestDTO request) {
        Announcement acc = announcementRepository.findById(id).orElseThrow();
        acc.setTitle(request.getTitle());
        acc.setContent(request.getContent());
        acc.setCategory(request.getCategory());
        acc.setPriority(request.getPriority());
        acc.setStatus(request.getStatus());
        acc.setPublishDate(request.getPublishDate());
        acc.setExpirationDate(request.getExpirationDate());
        acc.setUpdatedAt(Instant.now());
        return mapToDTO(announcementRepository.save(acc), false);
    }

    public void deleteAnnouncement(UUID id) {
        Announcement acc = announcementRepository.findById(id).orElseThrow();
        acc.setDeleted(true);
        announcementRepository.save(acc);
    }

    public AnnouncementResponseDTO updateStatus(UUID id, Announcement.AnnouncementStatus status) {
        Announcement acc = announcementRepository.findById(id).orElseThrow();
        acc.setStatus(status);
        if(status == Announcement.AnnouncementStatus.PUBLISHED && acc.getPublishDate() == null) {
            acc.setPublishDate(Instant.now());
        }
        return mapToDTO(announcementRepository.save(acc), false);
    }

    // --- TENANT METHODS ---

    // SAYFALAMA DESTEKLİ YENİ TENANT LİSTELEME METODU
    public Page<AnnouncementResponseDTO> getTenantAnnouncements(Pageable pageable) {
        User tenant = getAuthenticatedUser();
        UserProperty assignment = userPropertyRepository.findByUserIdAndIsDeletedFalse(tenant.getId())
                .stream().findFirst().orElseThrow(() -> new RuntimeException("No active property assigned"));

        UUID communityId = assignment.getProperty().getCommunity().getId();
        UUID propertyId = assignment.getProperty().getId();
        
        return announcementRepository.findActiveForTenant(communityId, propertyId, Instant.now(), pageable)
                .map(a -> {
                    boolean isRead = readReceiptRepository.existsByAnnouncementIdAndUserId(a.getId(), tenant.getId());
                    return mapToDTO(a, isRead);
                });
    }

    @Transactional
    public void markAsRead(UUID announcementId) {
        User tenant = getAuthenticatedUser();
        if (!readReceiptRepository.existsByAnnouncementIdAndUserId(announcementId, tenant.getId())) {
            Announcement acc = announcementRepository.findById(announcementId).orElseThrow();
            AnnouncementReadReceipt receipt = AnnouncementReadReceipt.builder()
                    .announcement(acc)
                    .user(tenant)
                    .readAt(Instant.now())
                    .build();
            receipt.setId(UUID.randomUUID());
            receipt.setCreatedAt(Instant.now());
            readReceiptRepository.save(receipt);
        }
    }

    private AnnouncementResponseDTO mapToDTO(Announcement a, boolean isRead) {
        return AnnouncementResponseDTO.builder()
                .id(a.getId())
                .communityId(a.getCommunity().getId())
                .communityName(a.getCommunity().getName())
                .propertyId(a.getProperty() != null ? a.getProperty().getId() : null)
                .propertyName(a.getProperty() != null ? a.getProperty().getUnitNumber() : "All Units")
                .title(a.getTitle())
                .content(a.getContent())
                .category(a.getCategory())
                .priority(a.getPriority())
                .status(a.getStatus())
                .publishDate(a.getPublishDate())
                .expirationDate(a.getExpirationDate())
                .createdAt(a.getCreatedAt())
                .isRead(isRead)
                .build();
    }
}