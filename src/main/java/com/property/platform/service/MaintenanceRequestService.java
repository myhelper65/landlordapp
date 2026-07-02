package com.property.platform.service;

import com.property.platform.entity.MaintenanceRequest;
import com.property.platform.entity.Property;
import com.property.platform.entity.User;
import com.property.platform.repository.MaintenanceRequestRepository;
import com.property.platform.repository.PropertyRepository;
import com.property.platform.repository.UserPropertyRepository;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceRequestService {

    private final MaintenanceRequestRepository maintenanceRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final UserPropertyRepository userPropertyRepository;

    // --- 1. YENİ TALEP OLUŞTURMA (RESİM YÜKLEME DESTEKLİ) ---
//    public Map<String, Object> createRequest(String title, String description, String priority, MultipartFile file, String email) {
//
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));
//
//        Property property = userPropertyRepository.findByUserIdAndIsDeletedFalse(user.getId())
//                .stream().findFirst()
//                .map(up -> up.getProperty())
//                .orElseThrow(() -> new RuntimeException("Aktif bir mülkünüz bulunmamaktadır!"));
//
//        String photoUrl = null;
//
//        if (file != null && !file.isEmpty()) {
//            try {
//                String uploadDir = "uploads/maintenance/";
//                java.nio.file.Files.createDirectories(java.nio.file.Paths.get(uploadDir));
//                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
//                java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + fileName);
//                java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
//                photoUrl = "/uploads/maintenance/" + fileName;
//            } catch (Exception e) {
//                throw new RuntimeException("Resim yüklenirken hata oluştu: " + e.getMessage());
//            }
//        }
//
//        MaintenanceRequest maintenanceRequest = MaintenanceRequest.builder()
//                .property(property)
//                .user(user)
//                .workOrderNumber(generateWorkOrderNumber())
//                .title(title)
//                .description(description)
//                .priority(MaintenanceRequest.RequestPriority.valueOf(priority))
//                .status(MaintenanceRequest.RequestStatus.OPEN)
//                .photoUrl(photoUrl)
//                .build();
//
//        maintenanceRequest.setId(UUID.randomUUID());
//        maintenanceRequest.setCreatedAt(Instant.now());
//
//        MaintenanceRequest savedRequest = maintenanceRepository.save(maintenanceRequest);
//        return mapToSafeJson(savedRequest);
//    }

    // --- 1. YENİ TALEP OLUŞTURMA (PARAMETREYE UUID propertyId EKLENDİ) ---
    public Map<String, Object> createRequest(String title, String description, String priority, MultipartFile file, String email, UUID propertyId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));

        Property property;

        // EĞER ADMIN FORMDAN BİR MÜLK SEÇTİYSE ONU KULLAN
        if (propertyId != null) {
            property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Seçilen mülk bulunamadı!"));
        }
        // EĞER KIRACI İSE KENDİ OTURDUĞU MÜLKÜ BUL
        else {
            property = userPropertyRepository.findByUserIdAndIsDeletedFalse(user.getId())
                    .stream().findFirst()
                    .map(up -> up.getProperty())
                    .orElseThrow(() -> new RuntimeException("Aktif bir mülkünüz bulunmamaktadır!"));
        }

        String photoUrl = null;

        // ... Metodun geri kalanı tamamen aynı (Resim yükleme ve kaydetme işlemleri) ...
        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = "uploads/maintenance/";
                java.nio.file.Files.createDirectories(java.nio.file.Paths.get(uploadDir));
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + fileName);
                java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                photoUrl = "/uploads/maintenance/" + fileName;
            } catch (Exception e) {
                throw new RuntimeException("Resim yüklenirken hata oluştu: " + e.getMessage());
            }
        }

        MaintenanceRequest maintenanceRequest = MaintenanceRequest.builder()
                .property(property)
                .user(user)
                .workOrderNumber(generateWorkOrderNumber())
                .title(title)
                .description(description)
                .priority(MaintenanceRequest.RequestPriority.valueOf(priority))
                .status(MaintenanceRequest.RequestStatus.OPEN)
                .photoUrl(photoUrl)
                .build();

        maintenanceRequest.setId(UUID.randomUUID());
        maintenanceRequest.setCreatedAt(Instant.now());

        MaintenanceRequest savedRequest = maintenanceRepository.save(maintenanceRequest);
        return mapToSafeJson(savedRequest);
    }



    // --- 2. DURUM GÜNCELLEME (ADMIN İÇİN) ---
    public Map<String, Object> updateStatus(UUID requestId, String newStatus) {
        MaintenanceRequest request = maintenanceRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Arıza talebi bulunamadı!"));

        request.setStatus(MaintenanceRequest.RequestStatus.valueOf(newStatus));
        request.setUpdatedAt(Instant.now());

        if (newStatus.equals("RESOLVED")) {
            request.setResolvedAt(Instant.now());
        }

        return mapToSafeJson(maintenanceRepository.save(request));
    }

    // --- 3. TÜM TALEPLERİ GETİR (ADMIN İÇİN) ---
    public List<Map<String, Object>> getAllRequests() {
        return maintenanceRepository.findAll().stream()
                .filter(req -> !req.isDeleted())
                .map(this::mapToSafeJson)
                .collect(Collectors.toList());
    }

    // --- 4. SADECE KENDİ TALEPLERİNİ GETİR (KİRACI İÇİN) ---
    public List<Map<String, Object>> getMyRequests(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        return maintenanceRepository.findByUserIdAndIsDeletedFalse(user.getId()).stream()
                .map(this::mapToSafeJson)
                .collect(Collectors.toList());
    }

    // --- 5. TALEBİ SİL (SOFT DELETE) ---
    public void deleteRequest(UUID id) {
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Arıza talebi bulunamadı!"));
        request.setDeleted(true);
        maintenanceRepository.save(request);
    }

    // --- 6. KİRACININ TALEBİNİ GÜNCELLEMESİ (EKSİK OLAN METOT BURADA) ---
    public Map<String, Object> updateTenantRequest(UUID id, String title, String description, String priority, MultipartFile file, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));
        MaintenanceRequest request = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kayıt bulunamadı"));

        if (!request.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bu kayıt üzerinde işlem yapma yetkiniz yok.");
        }

        request.setTitle(title);
        request.setDescription(description);
        request.setPriority(MaintenanceRequest.RequestPriority.valueOf(priority));

        if (file != null && !file.isEmpty()) {
            try {
                String uploadDir = "uploads/maintenance/";
                java.nio.file.Files.createDirectories(java.nio.file.Paths.get(uploadDir));
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + fileName);
                java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                request.setPhotoUrl("/uploads/maintenance/" + fileName);
            } catch (Exception e) {
                throw new RuntimeException("Resim güncellenirken hata: " + e.getMessage());
            }
        }

        request.setUpdatedAt(Instant.now());
        return mapToSafeJson(maintenanceRepository.save(request));
    }

    // --- SENİN ÖZEL WORK ORDER NUMARATÖRÜN ---
    private String generateWorkOrderNumber() {
        String r1 = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String r2 = UUID.randomUUID().toString().substring(4, 8).toUpperCase();
        String dateStr = java.time.LocalDate.now().format(
                java.time.format.DateTimeFormatter.ofPattern("MMMMddyy", java.util.Locale.ENGLISH)
        ).toUpperCase();
        return "WOI-" + r1 + "-" + r2 + "-" + dateStr;
    }

    // --- GÜVENLİK: SONSUZ DÖNGÜYÜ KIRAN HARİTALAMA (MAPPING) METODU ---
    private Map<String, Object> mapToSafeJson(MaintenanceRequest req) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", req.getId());
        map.put("title", req.getTitle());
        map.put("description", req.getDescription());
        map.put("priority", req.getPriority().name());
        map.put("status", req.getStatus().name());
        map.put("workOrderNumber", req.getWorkOrderNumber());
        map.put("photoUrl", req.getPhotoUrl());
        map.put("createdAt", req.getCreatedAt());

        if (req.getUser() != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("firstName", req.getUser().getFirstName());
            userMap.put("lastName", req.getUser().getLastName());
            userMap.put("email", req.getUser().getEmail());
            map.put("user", userMap);
        }

        if (req.getProperty() != null) {
            Map<String, Object> propMap = new HashMap<>();
            propMap.put("unitNumber", req.getProperty().getUnitNumber());
            if (req.getProperty().getCommunity() != null) {
                Map<String, Object> commMap = new HashMap<>();
                commMap.put("name", req.getProperty().getCommunity().getName());
                propMap.put("community", commMap);
            }
            map.put("property", propMap);
        }
        return map;
    }
}