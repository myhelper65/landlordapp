package com.property.platform.repository;

import com.property.platform.entity.AnnouncementReadReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AnnouncementReadReceiptRepository extends JpaRepository<AnnouncementReadReceipt, UUID> {
    boolean existsByAnnouncementIdAndUserId(UUID announcementId, UUID userId);
}