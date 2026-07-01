package com.property.platform.repository;

import com.property.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    long countByIsDeletedFalse();
    Optional<User> findByEmail(String email);
}