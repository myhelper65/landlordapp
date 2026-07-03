package com.property.platform.service;

import com.property.platform.dto.request.PropertyRequestDTO;
import com.property.platform.dto.response.PropertyResponseDTO;
import com.property.platform.entity.Community;
import com.property.platform.entity.Property;
import com.property.platform.entity.PropertyDocument;
import com.property.platform.repository.CommunityRepository;
import com.property.platform.repository.PropertyRepository;
import com.property.platform.repository.UserPropertyRepository; // EKSİK OLAN IMPORT EKLENDİ
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final CommunityRepository communityRepository;
    private final UserPropertyRepository userPropertyRepository; // EKSİK OLAN INJECTION EKLENDİ!
    private final com.property.platform.repository.PropertyDocumentRepository documentRepository;

    public PropertyResponseDTO createProperty(PropertyRequestDTO request) {

        // 1. İş Kuralı: Belirtilen site (Community) sistemde var mı?
        Community community = communityRepository.findByIdAndIsDeletedFalse(request.getCommunityId())
                .orElseThrow(() -> new RuntimeException("Belirtilen Site/Topluluk bulunamadı!"));

        // 2. İş Kuralı: Aynı sitede aynı daire/bina numarası (Örn: A Blok Daire 1) daha önce eklenmiş mi?
        if (propertyRepository.existsByCommunityIdAndUnitNumberAndIsDeletedFalse(community.getId(), request.getUnitNumber())) {
            throw new RuntimeException("Bu sitede aynı ünite numarasına sahip başka bir mülk zaten var!");
        }

        // 3. Entity Dönüşümü
        Property property = Property.builder()
                .community(community)
                .unitNumber(request.getUnitNumber())
                .propertyType(request.getPropertyType())
                // Yeni daireler otomatik VACANT başlar
                .status(Property.PropertyStatus.VACANT)
                .notes(request.getNotes())
                .build();

        // BaseEntity Alanları
        property.setId(UUID.randomUUID());
        property.setCreatedAt(Instant.now());
        property.setCreatedBy(UUID.randomUUID()); // İleride Security Context'ten gelecek

        // 4. Veritabanına Kaydet
        Property savedProperty = propertyRepository.save(property);

        // 5. Response DTO'ya dönüştür
        return PropertyResponseDTO.builder()
                .id(savedProperty.getId())
                .communityId(community.getId())
                .communityName(community.getName())
                .unitNumber(savedProperty.getUnitNumber())
                .propertyType(savedProperty.getPropertyType())
                .status(savedProperty.getStatus())
                .notes(savedProperty.getNotes())
                .build();
    }

    public List<PropertyResponseDTO> getAllProperties() {
        // Sadece silinmemiş olanları (isDeleted = false) getir
        return propertyRepository.findByIsDeletedFalse()
                .stream()
                .map(property -> {
                    var activeUserProp = userPropertyRepository.findByPropertyIdAndIsDeletedFalse(property.getId()).stream().findFirst().orElse(null);
                    String tName = activeUserProp != null ? activeUserProp.getUser().getFirstName() + " " + activeUserProp.getUser().getLastName() : null;
                    String tEmail = activeUserProp != null ? activeUserProp.getUser().getEmail() : null;

                    return PropertyResponseDTO.builder()
                        .id(property.getId())
                        .communityId(property.getCommunity().getId())
                        .communityName(property.getCommunity().getName())
                        .unitNumber(property.getUnitNumber())
                        .propertyType(property.getPropertyType())
                        .status(property.getStatus())
                        .notes(property.getNotes())
                        .tenantName(tName)
                        .tenantEmail(tEmail)
                        .build();
                })
                .collect(Collectors.toList());
    }

    public void deleteProperty(UUID id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Silinecek mülk bulunamadı!"));

        // 1. BaseEntity'den gelen isDeleted bayrağını true yap (Soft Delete)
        property.setDeleted(true);

        // 2. Durumunu sisteme yeni eklediğimiz INACTIVE yap
        property.setStatus(Property.PropertyStatus.INACTIVE);

        // 3. Veritabanında güncelle
        propertyRepository.save(property);
        
        // 4. Mülke bağlı olan aktif kiracı ilişkilerini de (Lease) soft delete yap
        userPropertyRepository.findByPropertyIdAndIsDeletedFalse(id).forEach(lease -> {
            lease.setDeleted(true);
            userPropertyRepository.save(lease);
        });
    }


    // Mülk Güncelleme (Edit) Metodu
    public PropertyResponseDTO updateProperty(UUID id, PropertyRequestDTO requestDTO) {
        // 1. Güncellenecek mülkü bul
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Güncellenecek mülk bulunamadı!"));

        // 2. Yeni seçilen siteyi (Community) bul
        Community community = communityRepository.findByIdAndIsDeletedFalse(requestDTO.getCommunityId())
                .orElseThrow(() -> new RuntimeException("Belirtilen Site/Topluluk bulunamadı!"));

        // 3. Bilgileri Güncelle
        property.setCommunity(community);
        property.setUnitNumber(requestDTO.getUnitNumber());
        property.setPropertyType(requestDTO.getPropertyType());
        property.setUpdatedAt(Instant.now());

        // 4. Veritabanına kaydet
        Property updatedProperty = propertyRepository.save(property);

        // 5. Güncel veriyi dön
        return PropertyResponseDTO.builder()
                .id(updatedProperty.getId())
                .communityId(community.getId())
                .communityName(community.getName())
                .unitNumber(updatedProperty.getUnitNumber())
                .propertyType(updatedProperty.getPropertyType())
                .status(updatedProperty.getStatus())
                .notes(updatedProperty.getNotes())
                .build();
    }

    /**
     * Fetches all active tenants/users assigned to a specific property.
     * Used for cascading dropdowns in the frontend.
     */
    public List<com.property.platform.entity.User> getUsersAssignedToProperty(java.util.UUID propertyId) {
        // Find all active links for this property in the user_properties table
        return userPropertyRepository.findByPropertyIdAndIsDeletedFalse(propertyId)
                .stream()
                .map(userProperty -> userProperty.getUser()) // Extract the User object from the mapping
                .collect(java.util.stream.Collectors.toList());
    }






    // --- DOSYA YÜKLEME METODU ---
    public com.property.platform.dto.response.DocumentDTO uploadDocument(UUID propertyId, org.springframework.web.multipart.MultipartFile file) {
        Property property = propertyRepository.findByIdAndIsDeletedFalse(propertyId)
                .orElseThrow(() -> new RuntimeException("No property  found!!"));

        // İş Kuralı: Max 4 dosya
        if (documentRepository.countByPropertyIdAndIsDeletedFalse(propertyId) >= 4) {
            throw new RuntimeException("Max 4 uploads and attachments allowed.");
        }

        try {
            // "uploads/properties/{id}" klasörünü oluştur
            java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads/properties/" + propertyId);
            if (!java.nio.file.Files.exists(uploadPath)) {
                java.nio.file.Files.createDirectories(uploadPath);
            }

            // Dosya ismini benzersiz yap (çakışmaları önlemek için)
            String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            java.nio.file.Path filePath = uploadPath.resolve(uniqueFileName);

            // Dosyayı diske kaydet
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Veritabanına kaydet
            PropertyDocument document = PropertyDocument.builder()
                    .property(property)
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileUrl("/uploads/properties/" + propertyId + "/" + uniqueFileName)
                    .build();

            document.setId(UUID.randomUUID());
            document.setCreatedAt(Instant.now());
            documentRepository.save(document);

            return com.property.platform.dto.response.DocumentDTO.builder()
                    .id(document.getId())
                    .fileName(document.getFileName())
                    .fileType(document.getFileType())
                    .fileUrl(document.getFileUrl())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Dosya yüklenirken hata oluştu: " + e.getMessage());
        }
    }

    // --- MÜLK DETAYLARINI (KİRACI VE BELGELERLE) GETİRME METODU ---
    public PropertyResponseDTO getPropertyDetails(UUID propertyId) {
        Property property = propertyRepository.findByIdAndIsDeletedFalse(propertyId)
                .orElseThrow(() -> new RuntimeException("No property found!!!"));

        // Aktif kiracının adını ve mailini bul
        var activeUserProp = userPropertyRepository.findByPropertyIdAndIsDeletedFalse(propertyId).stream().findFirst().orElse(null);
        String tenantName = activeUserProp != null ? activeUserProp.getUser().getFirstName() + " " + activeUserProp.getUser().getLastName() : "No Active Tenant";
        String tenantEmail = activeUserProp != null ? activeUserProp.getUser().getEmail() : null;

        // Yüklenmiş belgeleri çek
        List<com.property.platform.dto.response.DocumentDTO> docs = documentRepository.findByPropertyIdAndIsDeletedFalse(propertyId).stream()
                .map(doc -> com.property.platform.dto.response.DocumentDTO.builder()
                        .id(doc.getId())
                        .fileName(doc.getFileName())
                        .fileType(doc.getFileType())
                        .fileUrl(doc.getFileUrl())
                        .build())
                .collect(Collectors.toList());

        return PropertyResponseDTO.builder()
                .id(property.getId())
                .communityId(property.getCommunity().getId())
                .communityName(property.getCommunity().getName())
                .unitNumber(property.getUnitNumber())
                .propertyType(property.getPropertyType())
                .status(property.getStatus())
                .notes(property.getNotes())
                .tenantName(tenantName)
                .tenantEmail(tenantEmail)
                .documents(docs)
                .build();
    }
}