package com.property.platform.config;

import com.property.platform.entity.User;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Admin
        if (userRepository.findByEmail("admin@property.com").isEmpty()) {
            User admin = User.builder()
                    .email("admin@property.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Super")
                    .lastName("Admin")
                    .role(User.UserRole.SUPER_ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("✅ Default admin user created: admin@property.com / admin123");
        }

        // Create Tenant
        if (userRepository.findByEmail("tenant@property.com").isEmpty()) {
            User tenant = User.builder()
                    .email("tenant@property.com")
                    .password(passwordEncoder.encode("tenant123"))
                    .firstName("John")
                    .lastName("Doe")
                    .role(User.UserRole.TENANT)
                    .build();
            userRepository.save(tenant);
            System.out.println("✅ Default tenant user created: tenant@property.com / tenant123");
        }
    }
}
