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

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody com.property.platform.dto.request.ForgotPasswordRequestDTO request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("If that email address is in our database, we will send you an email to reset your password.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody com.property.platform.dto.request.ResetPasswordRequestDTO request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password successfully reset.");
    }

    @PostMapping("/admin-setup")
    public ResponseEntity<AuthResponseDTO> setupAdmin(
            @RequestBody com.property.platform.dto.request.AdminSetupRequestDTO request,
            java.security.Principal principal) {
        // principal.getName() is the email from the JWT
        return ResponseEntity.ok(authService.setupAdmin(principal.getName(), request));
    }
}