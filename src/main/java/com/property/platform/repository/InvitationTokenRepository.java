package com.property.platform.repository;

import com.property.platform.entity.InvitationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvitationTokenRepository extends JpaRepository<InvitationToken, UUID> {
    Optional<InvitationToken> findByTokenHashAndUsedFalse(String tokenHash);
}
