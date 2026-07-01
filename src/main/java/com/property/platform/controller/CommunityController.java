package com.property.platform.controller;

import com.property.platform.dto.request.CommunityRequestDTO;
import com.property.platform.dto.response.CommunityResponseDTO;
import com.property.platform.service.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping
    public ResponseEntity<CommunityResponseDTO> createCommunity(@RequestBody CommunityRequestDTO request) {
        CommunityResponseDTO response = communityService.createCommunity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<CommunityResponseDTO>> getAllCommunities() {
        return ResponseEntity.ok(communityService.getAllCommunities());
    }
    // SİTeyi Güncelleme (Düzenleme Kalem İkonu İçin)
    @PutMapping("/{id}")
    public ResponseEntity<CommunityResponseDTO> updateCommunity(
            @PathVariable UUID id,
            @RequestBody CommunityRequestDTO requestDTO) {
        return ResponseEntity.ok(communityService.updateCommunity(id, requestDTO));
    }

    // Siteyi Silme (Çöp Kutusu İkonu İçin)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCommunity(@PathVariable UUID id) {
        communityService.deleteCommunity(id);
        return ResponseEntity.noContent().build(); // Başarıyla silindi, içerik yok mesajı (204)
    }

}