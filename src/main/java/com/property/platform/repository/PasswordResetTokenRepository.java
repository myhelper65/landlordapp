package com.property.platform.repository;

import com.property.platform.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findByToken(String token);
    
    // YENİ EK: Kullanıcının mevcut tüm token'larını silmek için
    void deleteByUserId(UUID userId);
}
