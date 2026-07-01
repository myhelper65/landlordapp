package com.property.platform.repository;

import com.property.platform.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {

    long countByIsDeletedFalse();
    // Belirli bir siteye (Community) ait, silinmemiş mülkleri listelemek için
    List<Property> findByCommunityIdAndIsDeletedFalse(UUID communityId);
    
    // Aynı sitede aynı daire/ünite numarasından iki tane olmasını engellemek için
    boolean existsByCommunityIdAndUnitNumberAndIsDeletedFalse(UUID communityId, String unitNumber);
    
    Optional<Property> findByIdAndIsDeletedFalse(UUID id);
    // PropertyRepository.java içine ekle:
    List<Property> findByIsDeletedFalse();

    // Sitenin ID'sine göre arama yapıp, isDeleted durumu false olan kayıt var mı diye bakar
    boolean existsByCommunityIdAndIsDeletedFalse(UUID communityId);
    // Statüye göre sayma (Boş daireleri bulmak için)
    long countByStatusAndIsDeletedFalse(Property.PropertyStatus status);
}