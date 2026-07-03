package com.property.platform.config;

import com.property.platform.entity.User;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BootstrapAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${bootstrap.admin.email:admin@propertymanager.com}")
    private String adminEmail;

    @Value("${bootstrap.admin.password:Admin@12345!}")
    private String adminPassword;

    public void run(String... args) throws Exception {
        // Check if this specific admin exists
        var existingAdminOpt = userRepository.findByEmail(adminEmail);
        if (existingAdminOpt.isEmpty()) {
            User bootstrapAdmin = User.builder()
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .firstName("Bootstrap")
                    .lastName("Administrator")
                    .role(User.UserRole.SUPER_ADMIN)
                    .enabled(true)
                    .emailVerified(true)
                    .firstLoginRequired(true)
                    .build();

            userRepository.save(bootstrapAdmin);
            System.out.println("✅ Bootstrap Administrator created successfully: " + adminEmail);
        } else {
            // Force update the password and status just in case it was messed up
            User existingAdmin = existingAdminOpt.get();
            existingAdmin.setPassword(passwordEncoder.encode(adminPassword));
            existingAdmin.setRole(User.UserRole.SUPER_ADMIN);
            existingAdmin.setEnabled(true);
            userRepository.save(existingAdmin);
            System.out.println("✅ Bootstrap Administrator updated successfully: " + adminEmail);
        }
    }
}
