package com.property.platform.controller;

import com.property.platform.dto.request.PropertyRequestDTO;
import com.property.platform.dto.response.PropertyResponseDTO;
import com.property.platform.entity.User;
import com.property.platform.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public ResponseEntity<PropertyResponseDTO> createProperty(@RequestBody PropertyRequestDTO request) {
        PropertyResponseDTO response = propertyService.createProperty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<PropertyResponseDTO>> getAllProperties() {
        // Eğer propertyService içinde getAllProperties metodu yoksa,
        // repository.findAll() yapıp DTO'ya mapleyen basit bir metot yazman gerekebilir.
        List<PropertyResponseDTO> properties = propertyService.getAllProperties();
        return ResponseEntity.ok(properties);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(@PathVariable UUID id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponseDTO> updateProperty(
            @PathVariable UUID id,
            @RequestBody PropertyRequestDTO requestDTO) {
        return ResponseEntity.ok(propertyService.updateProperty(id, requestDTO));
    }

    // GÜNCELLENEN METOT: Sonsuz döngüyü (Infinite Recursion) kırar!
    @GetMapping("/{propertyId}/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getUsersByProperty(@PathVariable UUID propertyId) {

        // Kullanıcıları bul ve sonsuz döngüyü engellemek için sadece gereken verileri Map'e çevir
        List<Map<String, Object>> safeTenants = propertyService.getUsersAssignedToProperty(propertyId)
                .stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("firstName", user.getFirstName());
                    map.put("lastName", user.getLastName());
                    map.put("role", user.getRole().name()); // Rolü Enum'dan String'e çevirir
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(safeTenants);
    }


    // MÜLK DETAYLARINI (KİRACI VE BELGELER) GETİRİR
    @GetMapping("/{id}/details")
    public ResponseEntity<PropertyResponseDTO> getPropertyDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(propertyService.getPropertyDetails(id));
    }

    // DOSYA YÜKLEME (MULTIPART) ENDPOINTİ
    @PostMapping(value = "/{id}/documents", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<com.property.platform.dto.response.DocumentDTO> uploadDocument(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(propertyService.uploadDocument(id, file));
    }
}