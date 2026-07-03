package com.property.platform.service;

import com.property.platform.dto.request.TenantActivationRequestDTO;
import com.property.platform.dto.request.TenantInvitationRequestDTO;
import com.property.platform.dto.response.AuthResponseDTO;
import com.property.platform.entity.InvitationToken;
import com.property.platform.entity.Property;
import com.property.platform.entity.User;
import com.property.platform.entity.UserProperty;
import com.property.platform.repository.InvitationTokenRepository;
import com.property.platform.repository.PropertyRepository;
import com.property.platform.repository.UserPropertyRepository;
import com.property.platform.repository.UserRepository;
import com.property.platform.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantInvitationService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final UserPropertyRepository userPropertyRepository;
    private final InvitationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public void inviteTenant(TenantInvitationRequestDTO request) {
        log.info("Starting tenant invitation process for email: {}", request.getEmail());
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Invitation failed: User with email {} already exists.", request.getEmail());
            throw new RuntimeException("User with this email already exists.");
        }

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> {
                    log.warn("Invitation failed: Property ID {} not found.", request.getPropertyId());
                    return new RuntimeException("Property not found.");
                });
        
        log.info("Found property {}, unit {}. Proceeding to create tenant record.", property.getId(), property.getUnitNumber());

        // 1. Create User
        User tenant = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(UUID.randomUUID().toString())) // placeholder
                .role(User.UserRole.TENANT)
                .status(User.UserStatus.INVITED)
                .firstLoginRequired(false) // Not needed for tenants, activation handles it
                .emailVerified(false)
                .build();
        userRepository.save(tenant);

        // 2. Create Lease (UserProperty)
        UserProperty lease = UserProperty.builder()
                .user(tenant)
                .property(property)
                .type(UserProperty.RelationshipType.TENANT)
                .leaseStartDate(request.getLeaseStartDate())
                .leaseEndDate(request.getLeaseEndDate())
                .monthlyRent(request.getMonthlyRent())
                .securityDeposit(request.getSecurityDeposit())
                .build();
        userPropertyRepository.save(lease);

        // Update property status to OCCUPIED
        property.setStatus(Property.PropertyStatus.OCCUPIED);
        propertyRepository.save(property);
        log.info("Property {} status updated to OCCUPIED.", property.getId());

        // 3. Generate Token
        log.info("Generating secure invitation token for tenant {}", tenant.getEmail());
        String rawToken = UUID.randomUUID().toString();
        // Hashing the token for DB storage using SHA-256
        String tokenHash = hashToken(rawToken);

        InvitationToken invitationToken = InvitationToken.builder()
                .user(tenant)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .used(false)
                .build();
        tokenRepository.save(invitationToken);

        // 4. Send Email
        log.info("=========================================================");
        log.info("TENANT INVITATION EMAIL MOCK");
        log.info("To: {}", request.getEmail());
        log.info("Subject: You're Invited to Your Property Management Portal");
        log.info("Link: http://localhost:5173/activate/{}", rawToken);
        log.info("(If your frontend is on a different port like 5174, change 5173 to that port)");
        log.info("=========================================================");
    }

    @Transactional(readOnly = true)
    public Map<String, String> getInvitationDetails(String rawToken) {
        if (rawToken == null) throw new RuntimeException("Token cannot be null.");
        rawToken = rawToken.trim();

        // To strictly follow "stored as hashed value", we will use SHA-256 so we can query it.
        String hash = hashToken(rawToken);
        
        InvitationToken token = tokenRepository.findByTokenHashAndUsedFalse(hash)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invitation token."));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Token has expired.");
        }

        User user = token.getUser();
        UserProperty lease = userPropertyRepository.findByUserIdAndIsDeletedFalse(user.getId())
                .stream().findFirst().orElseThrow();

        Map<String, String> details = new HashMap<>();
        details.put("firstName", user.getFirstName());
        details.put("lastName", user.getLastName());
        details.put("email", user.getEmail());
        details.put("unitNumber", lease.getProperty().getUnitNumber());
        if (lease.getProperty().getCommunity() != null) {
            details.put("communityName", lease.getProperty().getCommunity().getName());
        }
        return details;
    }

    @Transactional
    public AuthResponseDTO activateTenant(TenantActivationRequestDTO request) {
        log.info("Starting tenant activation process.");
        
        if (!request.isTermsAccepted()) {
            log.warn("Activation failed: Terms of service not accepted.");
            throw new RuntimeException("You must accept the Terms of Service.");
        }

        String rawToken = request.getToken();
        if (rawToken == null) {
            log.warn("Activation failed: Token is null.");
            throw new RuntimeException("Token cannot be null.");
        }
        rawToken = rawToken.trim();

        String hash = hashToken(rawToken);
        InvitationToken token = tokenRepository.findByTokenHashAndUsedFalse(hash)
                .orElseThrow(() -> {
                    log.warn("Activation failed: Invalid or already used token provided.");
                    return new RuntimeException("Invalid or expired invitation token.");
                });

        if (token.getExpiresAt().isBefore(Instant.now())) {
            log.warn("Activation failed: Token expired for user {}", token.getUser().getEmail());
            throw new RuntimeException("Token has expired.");
        }

        String newPw = request.getNewPassword();
        if (newPw == null || newPw.length() < 12 || 
            !newPw.matches(".*[A-Z].*") || 
            !newPw.matches(".*[a-z].*") || 
            !newPw.matches(".*[0-9].*") || 
            !newPw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new RuntimeException("Password must be at least 12 characters and include upper, lower, number, and special character.");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPw));
        user.setStatus(User.UserStatus.ACTIVE);
        user.setEmailVerified(true);
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);

        String jwtToken = jwtService.generateToken(user);
        
        return AuthResponseDTO.builder()
                .token(jwtToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstLoginRequired(false)
                .build();
    }

    private String hashToken(String token) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }
}
