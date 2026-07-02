package com.property.platform.service;

import com.property.platform.dto.response.DocumentDTO;
import com.property.platform.entity.RepairRequest;
import com.property.platform.entity.User;
import com.property.platform.entity.UserProperty;
import com.property.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final UserRepository userRepository;
    private final UserPropertyRepository userPropertyRepository;
    private final PropertyDocumentRepository documentRepository;
    // Ensure you have InvoiceRepository created in your project!
    private final InvoiceRepository invoiceRepository; 
    private final RepairRequestRepository repairRepository;
    // Helper method to securely get the logged-in user
    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in user not found in database!"));
    }

    // 1. GET MY LEASE DOCUMENTS
    public List<DocumentDTO> getMyLeaseDocuments() {
        User tenant = getAuthenticatedUser();

        // Find the property assigned to this tenant
        UserProperty assignment = userPropertyRepository.findByUserIdAndIsDeletedFalse(tenant.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("You are not currently assigned to any property."));

        // Return documents for that specific property
        return documentRepository.findByPropertyIdAndIsDeletedFalse(assignment.getProperty().getId())
                .stream()
                .map(doc -> DocumentDTO.builder()
                        .id(doc.getId())
                        .fileName(doc.getFileName())
                        .fileType(doc.getFileType())
                        .fileUrl(doc.getFileUrl())
                        .build())
                .collect(Collectors.toList());
    }

    // 2. GET MY INVOICES (PAYMENTS)
    // Returns the raw Entity or a DTO depending on your Invoice setup. 
    // Assuming it returns the Invoice entity for now.
    public List<com.property.platform.entity.Invoice> getMyInvoices() {
        User tenant = getAuthenticatedUser();
        // Return only invoices assigned to this specific tenant ID
        return invoiceRepository.findByUserIdAndIsDeletedFalse(tenant.getId());
    }

    // KİRACININ ONARIM TALEPLERİNİ GETİR
    // KİRACININ ONARIM TALEPLERİNİ GETİR (SONSUZ DÖNGÜYÜ KIRAN GÜVENLİ METOT)
    public java.util.List<java.util.Map<String, Object>> getMyRepairRequests() {
        com.property.platform.entity.User tenant = getAuthenticatedUser();

        return repairRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(tenant.getId())
                .stream()
                .map(req -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", req.getId());
                    map.put("title", req.getTitle());
                    map.put("description", req.getDescription());
                    map.put("priority", req.getPriority().name());
                    map.put("status", req.getStatus().name());
                    map.put("workOrderNumber", req.getWorkOrderNumber());
                    map.put("photoUrl", req.getPhotoUrl());
                    map.put("createdAt", req.getCreatedAt());

                    // Property (Mülk) ve Site (Community) bilgilerini güvenli bir şekilde ekle
                    if (req.getProperty() != null) {
                        java.util.Map<String, Object> propMap = new java.util.HashMap<>();
                        propMap.put("unitNumber", req.getProperty().getUnitNumber());

                        if (req.getProperty().getCommunity() != null) {
                            java.util.Map<String, Object> commMap = new java.util.HashMap<>();
                            commMap.put("name", req.getProperty().getCommunity().getName());
                            propMap.put("community", commMap);
                        }
                        map.put("property", propMap);
                    }
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
    }
    // YENİ ONARIM TALEBİ OLUŞTUR
    public com.property.platform.entity.RepairRequest createRepairRequest(String title, String description, String priority, MultipartFile file) {
        com.property.platform.entity.User tenant = getAuthenticatedUser();

        com.property.platform.entity.UserProperty assignment = userPropertyRepository.findByUserIdAndIsDeletedFalse(tenant.getId())
                .stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Aktif bir mülkünüz bulunmamaktadır."));

        String workOrder = "WO-" + System.currentTimeMillis();
        String photoUrl = null;

        // EĞER KULLANICI BİR RESİM SEÇTİYSE, BUNU KLASÖRE KAYDET
        if (file != null && !file.isEmpty()) {
            try {
                Path uploadPath = Paths.get("uploads/repairs/" + assignment.getProperty().getId());
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String uniqueFileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path filePath = uploadPath.resolve(uniqueFileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                photoUrl = "/uploads/repairs/" + assignment.getProperty().getId() + "/" + uniqueFileName;
            } catch (Exception e) {
                throw new RuntimeException("Resim yüklenirken hata oluştu: " + e.getMessage());
            }
        }

        com.property.platform.entity.RepairRequest request = com.property.platform.entity.RepairRequest.builder()
                .title(title)
                .description(description)
                .priority(com.property.platform.entity.RepairRequest.RequestPriority.valueOf(priority))
                .status(com.property.platform.entity.RepairRequest.RequestStatus.OPEN)
                .property(assignment.getProperty())
                .user(tenant)
                .workOrderNumber(workOrder)
                .photoUrl(photoUrl) // Resim URL'si veritabanına yazılıyor
                .build();

        request.setId(java.util.UUID.randomUUID());
        request.setCreatedAt(java.time.Instant.now());

        return repairRepository.save(request);
    }

    // SİLME İŞLEMİ (Soft Delete)
    public void deleteRepairRequest(java.util.UUID id) {
        com.property.platform.entity.User tenant = getAuthenticatedUser();
        com.property.platform.entity.RepairRequest req = repairRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kayıt bulunamadı"));

        // Sadece kendi talebini silebilir
        if(!req.getUser().getId().equals(tenant.getId())) {
            throw new RuntimeException("Bu işlem için yetkiniz yok.");
        }

        req.setDeleted(true); // Veritabanından tamamen uçurmak yerine gizliyoruz
        repairRepository.save(req);
    }

    // GÜNCELLEME İŞLEMİ
    public com.property.platform.entity.RepairRequest updateRepairRequest(java.util.UUID id, String title, String description, String priority, org.springframework.web.multipart.MultipartFile file) {
        com.property.platform.entity.User tenant = getAuthenticatedUser();
        com.property.platform.entity.RepairRequest req = repairRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Kayıt bulunamadı"));

        if(!req.getUser().getId().equals(tenant.getId())) {
            throw new RuntimeException("Bu işlem için yetkiniz yok.");
        }

        req.setTitle(title);
        req.setDescription(description);
        req.setPriority(com.property.platform.entity.RepairRequest.RequestPriority.valueOf(priority));

        // Eğer yeni bir fotoğraf yüklendiyse onu da güncelle
        if (file != null && !file.isEmpty()) {
            try {
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads/repairs/" + req.getProperty().getId());
                if (!java.nio.file.Files.exists(uploadPath)) java.nio.file.Files.createDirectories(uploadPath);
                String uniqueFileName = java.util.UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                java.nio.file.Path filePath = uploadPath.resolve(uniqueFileName);
                java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                req.setPhotoUrl("/uploads/repairs/" + req.getProperty().getId() + "/" + uniqueFileName);
            } catch (Exception e) {
                throw new RuntimeException("Resim güncellenirken hata: " + e.getMessage());
            }
        }
        return repairRepository.save(req);
    }
}