package com.property.platform.controller;

import com.property.platform.dto.request.FirstSetupRequestDTO;
import com.property.platform.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @PostMapping("/first-setup")
    public ResponseEntity<?> completeFirstSetup(
            Authentication authentication,
            @Valid @RequestBody FirstSetupRequestDTO request) {
        try {
            profileService.completeFirstSetup(authentication.getName(), request);
            return ResponseEntity.ok(Map.of("message", "First-time setup completed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
