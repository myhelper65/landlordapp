package com.property.platform.service;

import com.property.platform.dto.request.PropertyAssignmentRequestDTO;
import com.property.platform.dto.response.PropertyAssignmentResponseDTO;
import com.property.platform.entity.Property;
import com.property.platform.entity.User;
import com.property.platform.entity.UserProperty;
import com.property.platform.repository.PropertyRepository;
import com.property.platform.repository.UserRepository;
import com.property.platform.repository.UserPropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserPropertyService {

    private final UserPropertyRepository userPropertyRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;

    public PropertyAssignmentResponseDTO assignUserToProperty(PropertyAssignmentRequestDTO request) {

        // 1. Kullanıcı kontrolü
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Belirtilen kullanıcı sistemde bulunamadı!"));

        // 2. Mülk kontrolü
        Property property = propertyRepository.findByIdAndIsDeletedFalse(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Belirtilen mülk/daire bulunamadı!"));

        // 3. Mükerrer kayıt kontrolü
        if (userPropertyRepository.existsByUserIdAndPropertyIdAndTypeAndIsDeletedFalse(
                user.getId(), property.getId(), request.getType())) {
            throw new RuntimeException("Bu kullanıcı zaten bu mülke aynı rolle atanmış durumda!");
        }

        // 4. İlişkiyi eşleme ve kaydetme
        UserProperty userProperty = UserProperty.builder()
                .user(user)
                .property(property)
                .type(request.getType())
                .build();

        userProperty.setId(UUID.randomUUID());
        userProperty.setCreatedAt(Instant.now());
        userProperty.setCreatedBy(UUID.randomUUID()); // Audit altyapısı devreye girene kadar geçici

        UserProperty savedAssignment = userPropertyRepository.save(userProperty);

        // ==============================================================================
        // İŞTE EKLENEN KRİTİK KISIM: Mülkün durumunu "DOLU" (OCCUPIED) olarak güncelle
        // ==============================================================================
        property.setStatus(Property.PropertyStatus.OCCUPIED);
        propertyRepository.save(property);
        // ==============================================================================

        // 5. Yanıt DTO'su dönme
        return PropertyAssignmentResponseDTO.builder()
                .id(savedAssignment.getId())
                .userId(user.getId())
                .userEmail(user.getEmail())
                .propertyId(property.getId())
                .unitNumber(property.getUnitNumber())
                .type(savedAssignment.getType())
                .build();
    }
}