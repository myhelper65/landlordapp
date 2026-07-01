package com.property.platform.repository;

import com.property.platform.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {
    
    List<PaymentMethod> findAllByUserIdAndIsDeletedFalse(UUID userId);
    
    Optional<PaymentMethod> findByIdAndUserIdAndIsDeletedFalse(UUID id, UUID userId);
}