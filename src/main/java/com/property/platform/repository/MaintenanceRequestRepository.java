package com.property.platform.repository;

import com.property.platform.entity.MaintenanceRequest;
import com.property.platform.entity.MaintenanceRequest.RequestStatus;
import com.property.platform.entity.MaintenanceRequest.RequestPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, UUID> {

    List<MaintenanceRequest> findByPropertyIdAndIsDeletedFalse(UUID propertyId);

    List<MaintenanceRequest> findByUserIdAndIsDeletedFalse(UUID userId);

    // Tek bir statüye göre açık olanları sayma (Örn: Sadece OPEN olanlar)
    long countByStatusAndIsDeletedFalse(RequestStatus status);

    // Birden fazla statüye göre açık olanları sayma (Örn: OPEN ve IN_PROGRESS olanlar)
    long countByStatusInAndIsDeletedFalse(List<RequestStatus> statuses);

    // Hem Öncelik (Priority) listesine hem de Statü listesine göre sayma
    // (Örn: HIGH ve URGENT olanlar ile OPEN ve IN_PROGRESS olanların kesişimi)
    long countByPriorityInAndStatusInAndIsDeletedFalse(List<RequestPriority> priorities, List<RequestStatus> statuses);

    long countByUserIdAndStatusInAndIsDeletedFalse(UUID userId, List<MaintenanceRequest.RequestStatus> statuses);

    List<MaintenanceRequest> findByUserIdAndStatusInAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId, List<MaintenanceRequest.RequestStatus> statuses);
}