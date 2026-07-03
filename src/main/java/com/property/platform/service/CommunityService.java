package com.property.platform.service;
import java.time.Instant;
import com.property.platform.dto.request.CommunityRequestDTO;
import com.property.platform.dto.response.CommunityResponseDTO;
import com.property.platform.entity.Community;
import com.property.platform.repository.CommunityRepository;
import com.property.platform.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;

    // BAŞKA BİR REPOSITORY'E ERİŞMEK İÇİN BUNU EKLEMEK ZORUNDAYIZ:
    private final PropertyRepository propertyRepository;
    public CommunityResponseDTO createCommunity(CommunityRequestDTO request) {
        
        // 1. İş Kuralı: Aynı isimde aktif bir site var mı kontrol et
        if (communityRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new RuntimeException("Bu isimde bir topluluk/site zaten sistemde kayıtlı!");
        }

        // 2. DTO'dan Entity'e dönüştürme (Mapping)
        // 2. DTO'dan Entity'e dönüştürme (Mapping)
        Community community = Community.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .description(request.getDescription())
                .build();

        // BaseEntity zorunlu alanlarını doldur
        community.setId(UUID.randomUUID());
        community.setCreatedAt(Instant.now()); // LocalDateTime yerine Instant kullanıyoruz
        community.setCreatedBy(UUID.randomUUID());
        // 3. Veritabanına kaydet
        Community savedCommunity = communityRepository.save(community);

        // BULK APARTMENT GENERATION LOGIC
        if (request.getNumberOfUnits() != null && request.getNumberOfUnits() > 0) {
            String prefix = request.getUnitPrefix() != null ? request.getUnitPrefix() : "";
            java.util.List<com.property.platform.entity.Property> propertiesToCreate = new java.util.ArrayList<>();
            for (int i = 1; i <= request.getNumberOfUnits(); i++) {
                com.property.platform.entity.Property newProperty = com.property.platform.entity.Property.builder()
                        .community(savedCommunity)
                        .unitNumber(prefix + i) // e.g. "A-1" or "1"
                        .propertyType(com.property.platform.entity.Property.PropertyType.APARTMENT)
                        .status(com.property.platform.entity.Property.PropertyStatus.VACANT)
                        .notes("Auto-generated")
                        .build();
                
                newProperty.setId(UUID.randomUUID());
                newProperty.setCreatedAt(Instant.now());
                newProperty.setCreatedBy(savedCommunity.getCreatedBy());
                
                propertiesToCreate.add(newProperty);
            }
            propertyRepository.saveAll(propertiesToCreate);
        }

        // 4. Entity'i tekrar Response DTO'ya dönüştür ve geri dön
        return CommunityResponseDTO.builder()
                .id(savedCommunity.getId())
                .name(savedCommunity.getName())
                .address(savedCommunity.getAddress())
                .city(savedCommunity.getCity())
                .state(savedCommunity.getState())
                .zipCode(savedCommunity.getZipCode())
                .description(savedCommunity.getDescription())
                .build();
    }


    public List<CommunityResponseDTO> getAllCommunities() {
        return communityRepository.findAll().stream()
                .filter(community -> !community.isDeleted()) // Sadece silinmemiş olanları getir
                .map(community -> CommunityResponseDTO.builder()
                        .id(community.getId())
                        .name(community.getName())
                        .address(community.getAddress())
                        .city(community.getCity())
                        .state(community.getState())
                        .zipCode(community.getZipCode())
                        .description(community.getDescription())
                        .build())
                .collect(Collectors.toList());
    }

    public void deleteCommunity(UUID id) {
        // 1. Önce silinmek istenen siteyi bul
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Silinmek istenen site bulunamadı!"));

        // 2. İŞ KURALI KONTROLÜ: Bu siteye bağlı aktif mülk var mı?
        boolean hasActiveProperties = propertyRepository.existsByCommunityIdAndIsDeletedFalse(id);
        if (hasActiveProperties) {
            // Eğer varsa, işlemi durdur ve hata fırlat
            throw new RuntimeException("Bu site silinemez! Siteye kayıtlı aktif mülkler bulunmaktadır. Lütfen önce mülkleri silin veya başka bir siteye taşıyın.");
        }

        // 3. Eğer mülk yoksa, siteyi güvenle "Soft Delete" yapabiliriz
        community.setDeleted(true);
        // İstersen burada statüsünü de INACTIVE yapabilirsin (eğer CommunityStatus gibi bir enum varsa)

        communityRepository.save(community);
    }

    // Güncelleme Metodu
    public CommunityResponseDTO updateCommunity(UUID id, CommunityRequestDTO requestDTO) {
        Community community = communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Güncellenecek site bulunamadı!"));

        community.setName(requestDTO.getName());
        community.setCity(requestDTO.getCity());
        community.setState(requestDTO.getState());
        // Varsa diğer alanları da set et (zipCode vb.)

        Community updatedCommunity = communityRepository.save(community);

        return CommunityResponseDTO.builder()
                .id(updatedCommunity.getId())
                .name(updatedCommunity.getName())
                .city(updatedCommunity.getCity())
                .state(updatedCommunity.getState())
                .build();
    }
}