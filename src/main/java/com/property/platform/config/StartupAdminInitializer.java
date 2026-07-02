package com.property.platform.config;

import com.property.platform.entity.User;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StartupAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByRole(User.UserRole.SUPER_ADMIN)) {
            log.info("No SUPER_ADMIN found. Creating default initial administrator...");
            
            User defaultAdmin = User.builder()
                    .email("admin@propertymanager.com")
                    .firstName("System")
                    .lastName("Administrator")
                    .password(passwordEncoder.encode("Admin@12345"))
                    .role(User.UserRole.SUPER_ADMIN)
                    .firstLoginRequired(true)
                    .enabled(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(defaultAdmin);
            log.info("Default initial administrator created: admin@propertymanager.com");
        } else {
            log.info("SUPER_ADMIN already exists. Skipping default initialization.");
        }
    }
}
