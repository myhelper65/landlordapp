package com.property.platform.repository;

import com.property.platform.entity.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community, UUID> {

    long countByIsDeletedFalse();
    // Aynı isimde ikinci bir site eklenmesini engellemek için kontrol metodu
    boolean existsByNameAndIsDeletedFalse(String name);
    
    // Sadece silinmemiş siteleri getirmek için
    Optional<Community> findByIdAndIsDeletedFalse(UUID id);
}