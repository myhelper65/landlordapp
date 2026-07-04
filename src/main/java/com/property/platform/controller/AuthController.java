package com.property.platform.controller;

import com.property.platform.dto.request.LoginRequestDTO;
import com.property.platform.dto.response.AuthResponseDTO;
import com.property.platform.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@RequestBody com.property.platform.dto.request.RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/change-password")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @RequestBody com.property.platform.dto.request.ChangePasswordRequestDTO request,
            org.springframework.security.core.Authentication authentication) {
        
        com.property.platform.entity.User user = (com.property.platform.entity.User) authentication.getPrincipal();
        try {
            authService.changePassword(request, user.getId());
            return ResponseEntity.ok(java.util.Map.of("message", "Şifreniz başarıyla güncellendi."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponseDTO> googleLogin(@RequestBody com.property.platform.dto.request.GoogleLoginRequest request) {
        try {
            return ResponseEntity.ok(authService.googleLogin(request));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
    }
}