package com.property.platform.repository;

import com.property.platform.entity.Announcement;
import com.property.platform.entity.Announcement.AnnouncementStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    
    // Admin: Get all with Search, Filter, and Pagination
    @Query("SELECT a FROM Announcement a WHERE a.community.id = :communityId " +
           "AND (CAST(:search AS String) IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', CAST(:search AS String), '%'))) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND a.isDeleted = false")
    Page<Announcement> findByFiltersForAdmin(
            @Param("communityId") UUID communityId, 
            @Param("search") String search, 
            @Param("status") AnnouncementStatus status, 
            Pageable pageable);
    
    // Tenant: Get published, active announcements with Pagination
    @Query("SELECT a FROM Announcement a WHERE a.community.id = :communityId " +
           "AND (a.property.id = :propertyId OR a.property IS NULL) " +
           "AND a.status = 'PUBLISHED' " +
           "AND a.isDeleted = false " +
           "AND (a.publishDate IS NULL OR a.publishDate <= :now) " +
           "AND (a.expirationDate IS NULL OR a.expirationDate >= :now) " +
           "ORDER BY CASE a.priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'NORMAL' THEN 3 ELSE 4 END ASC, a.publishDate DESC")
    Page<Announcement> findActiveForTenant(
            @Param("communityId") UUID communityId, 
            @Param("propertyId") UUID propertyId, 
            @Param("now") Instant now, 
            Pageable pageable);

    Page<Announcement> findByCommunityIdAndStatus(UUID communityId, AnnouncementStatus status, Pageable pageable);

}
