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
}