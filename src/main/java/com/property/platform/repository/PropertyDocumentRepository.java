package com.property.platform.repository;

import com.property.platform.entity.PropertyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PropertyDocumentRepository extends JpaRepository<PropertyDocument, UUID> {

    // Bir mülke ait silinmemiş tüm belgeleri getir
    List<PropertyDocument> findByPropertyIdAndIsDeletedFalse(UUID propertyId);

    // Yükleme sınırını (Max 4 dosya) kontrol etmek için belge sayısını getir
    long countByPropertyIdAndIsDeletedFalse(UUID propertyId);


}