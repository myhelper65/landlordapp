package com.property.platform.repository;

import com.property.platform.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    // Kiracının sadece kendi ödeme geçmişini görmesi için:
    List<Payment> findAllByTenantIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID tenantId);
    
    // Idempotency (tekrar eden ödeme engelleme) için:
    boolean existsByIdempotencyKey(String idempotencyKey);
    Optional<Payment> findByIdempotencyKey(String idempotencyKey);
}