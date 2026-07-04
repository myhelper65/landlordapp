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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public PropertyAssignmentResponseDTO assignUserToProperty(PropertyAssignmentRequestDTO request) {

        // 1. Kullanıcı kontrolü veya oluşturulması
        User user;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("Belirtilen kullanıcı sistemde bulunamadı!"));
        } else {
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                throw new RuntimeException("Yeni kiracı oluşturmak için email adresi zorunludur!");
            }
            // Check if exists
            user = userRepository.findByEmail(request.getEmail()).orElseGet(() -> {
                User newUser = User.builder()
                        .email(request.getEmail())
                        .firstName(request.getFirstName())
                        .lastName(request.getLastName())
                        .phoneNumber(request.getPhoneNumber())
                        .role(User.UserRole.TENANT)
                        .password(passwordEncoder.encode("welcome123")) // Temp password
                        .firstLoginRequired(true)
                        .build();
                return userRepository.save(newUser);
            });
        }

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