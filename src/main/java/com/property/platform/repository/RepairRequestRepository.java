package com.property.platform.repository;

import com.property.platform.entity.RepairRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RepairRequestRepository extends JpaRepository<RepairRequest, UUID> {
    
    // Kiracının kendi onarım taleplerini görmesi için
    List<RepairRequest> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);
    
    // Adminin tüm onarım taleplerini görmesi için
    List<RepairRequest> findByIsDeletedFalseOrderByCreatedAtDesc();
}