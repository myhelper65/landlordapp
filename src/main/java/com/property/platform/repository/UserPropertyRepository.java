package com.property.platform.repository;

import com.property.platform.entity.UserProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserPropertyRepository extends JpaRepository<UserProperty, UUID> {
    
    // Bir mülke (daireye) atanmış aktif kullanıcıları listelemek için
    List<UserProperty> findByPropertyIdAndIsDeletedFalse(UUID propertyId);
    
    // Bir kullanıcının (Örn: Ev sahibinin) sahip olduğu tüm mülkleri listelemek için
    List<UserProperty> findByUserIdAndIsDeletedFalse(UUID userId);
    
    // Mükerrer atamayı engellemek için kontrol
    boolean existsByUserIdAndPropertyIdAndTypeAndIsDeletedFalse(UUID userId, UUID propertyId, UserProperty.RelationshipType type);

    // Sistemdeki tüm aktif mülk-kullanıcı eşleşmelerini getirir
    List<com.property.platform.entity.UserProperty> findByIsDeletedFalse();
}