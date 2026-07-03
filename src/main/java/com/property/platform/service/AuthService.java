package com.property.platform.service;

import com.property.platform.dto.request.LoginRequestDTO;
import com.property.platform.dto.response.AuthResponseDTO;
import com.property.platform.repository.UserRepository;
import com.property.platform.security.JwtService;
import com.property.platform.entity.PasswordResetToken;
import com.property.platform.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public AuthResponseDTO login(LoginRequestDTO request) {
        log.info("Login attempt for email: {}", request.getEmail());
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            log.warn("Login failed for email: {} - {}", request.getEmail(), e.getMessage());
            throw new RuntimeException("Invalid email or password");
        }

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return AuthResponseDTO.builder()
                .token(jwtToken)
                .id(user.getId())       // BU SATIR ÖNEMLİ (FRONTEND İÇİN)
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstLoginRequired(user.isFirstLoginRequired())
                .build();
    }

    public AuthResponseDTO register(com.property.platform.dto.request.RegisterRequestDTO request) {
        log.info("Registration attempt for email: {}", request.getEmail());

        // 1. Postman'dan gelen rolü güvenli bir şekilde belirle
        com.property.platform.entity.User.UserRole userRole;
        try {
            // Eğer rol boş veya null gelirse varsayılan olarak TENANT ata
            String roleStr = (request.getRole() != null && !request.getRole().trim().isEmpty())
                    ? request.getRole().toUpperCase()
                    : "TENANT";
            userRole = com.property.platform.entity.User.UserRole.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            // Yanlış veya eşleşmeyen bir kelime gönderilirse sistemi çökertme, TENANT yap
            userRole = com.property.platform.entity.User.UserRole.TENANT;
        }

        // 2. Yeni kullanıcıyı oluştur (Sabit değil, dinamik rol ile)
        var user = com.property.platform.entity.User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole) // DİNAMİK ROL ATAMASI
                .build();

        // 3. Kullanıcıyı veritabanına kaydet
        userRepository.save(user);

        // 4. Token üret
        var jwtToken = jwtService.generateToken(user);

        // 5. AuthResponseDTO'yu Builder ile dönüyoruz
        return AuthResponseDTO.builder()
                .token(jwtToken)
                .id(user.getId()) // Kayıt sonrası ID dönmesi React için gereklidir
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @org.springframework.transaction.annotation.Transactional
    public void forgotPassword(String email) {
        var userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isPresent()) {
            var user = userOptional.get();
            
            // Mevcut tokenları temizle
            passwordResetTokenRepository.deleteByUserId(user.getId());
            
            // Yeni token oluştur
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(token)
                    .user(user)
                    .expiryDate(Instant.now().plus(15, ChronoUnit.MINUTES))
                    .build();
                    
            passwordResetTokenRepository.save(resetToken);
            
            // Console'a logla (MOCK EMAIL SENDER)
            log.info("=========================================================");
            log.info("PASSWORD RESET EMAIL MOCK");
            log.info("To: {}", email);
            log.info("Link: http://localhost:5173/reset-password?token={}", token);
            log.info("=========================================================");
        } else {
            log.warn("Password reset requested for unknown email: {}", email);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or missing token"));
                
        if (resetToken.getExpiryDate().isBefore(Instant.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired");
        }
        
        var user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Token'ı kullandıktan sonra sil
        passwordResetTokenRepository.delete(resetToken);
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponseDTO setupAdmin(String email, com.property.platform.dto.request.AdminSetupRequestDTO request) {
        log.info("Admin setup attempt for email: {}", email);
        var user = userRepository.findByEmail(email).orElseThrow(() -> {
            log.warn("Admin setup failed: Admin not found for email: {}", email);
            return new RuntimeException("Admin not found");
        });

        if (!user.isFirstLoginRequired()) {
            log.warn("Admin setup failed: First login setup already completed for email: {}", email);
            throw new RuntimeException("First login setup already completed");
        }

        // 1. Verify current password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getCurrentPassword())
        );

        // 2. Password complexity validation
        String newPw = request.getNewPassword();
        if (newPw == null || newPw.length() < 12 || 
            !newPw.matches(".*[A-Z].*") || 
            !newPw.matches(".*[a-z].*") || 
            !newPw.matches(".*[0-9].*") || 
            !newPw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?].*")) {
            throw new RuntimeException("Password must be at least 12 characters and include upper, lower, number, and special character.");
        }

        // 3. Update Profile
        user.setPassword(passwordEncoder.encode(newPw));
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null && !request.getEmail().isEmpty()) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        
        user.setFirstLoginRequired(false);
        userRepository.save(user);

        // 4. Generate new token since email or password changed
        var jwtToken = jwtService.generateToken(user);
        
        return AuthResponseDTO.builder()
                .token(jwtToken)
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstLoginRequired(false)
                .build();
    }
}