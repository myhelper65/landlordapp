package com.property.platform.controller;

import com.property.platform.entity.User;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // React'in kiracı seçme menüsünü (Dropdown) doldurmak için kullanacağı metot
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/invite-tenant")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('PROPERTY_MANAGER')")
    public ResponseEntity<?> inviteTenant(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.property.platform.dto.request.InviteTenantRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "User with this email already exists."));
        }

        // Generate a random temporary password or just use a default since they will use Google Sign In
        String tempPassword = java.util.UUID.randomUUID().toString();

        User newTenant = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.UserRole.TENANT)
                .password(new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(tempPassword))
                .build();

        userRepository.save(newTenant);

        return ResponseEntity.ok(java.util.Map.of("message", "Tenant invited successfully.", "email", newTenant.getEmail()));
    }
}