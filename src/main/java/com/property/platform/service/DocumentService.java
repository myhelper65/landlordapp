package com.property.platform.service;

import com.property.platform.dto.response.DocumentResponseDTO;
import com.property.platform.entity.Document;
import com.property.platform.entity.MaintenanceRequest;
import com.property.platform.entity.Property;
import com.property.platform.entity.User;
import com.property.platform.repository.DocumentRepository;
import com.property.platform.repository.MaintenanceRequestRepository;
import com.property.platform.repository.PropertyRepository;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final MaintenanceRequestRepository maintenanceRepository;

    // Dosyaların kaydedileceği yerel klasör (AWS S3'e geçene kadar)
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public DocumentResponseDTO uploadDocument(MultipartFile file, UUID propertyId, UUID userId, UUID requestId) {

        try {
            // 1. Uploads klasörü yoksa oluştur
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 2. Dosya ismini çakışmaları önlemek için benzersiz (UUID) yap
            String originalFileName = file.getOriginalFilename();
            String uniqueFileName = UUID.randomUUID() + "_" + originalFileName;
            Path filePath = uploadPath.resolve(uniqueFileName);

            // 3. Dosyayı fiziksel olarak diske (veya ileride S3'e) kaydet
            Files.copy(file.getInputStream(), filePath);

            // 4. Veritabanı Entity'sini hazırla
            Document document = Document.builder().fileName(originalFileName).fileType(file.getContentType()).fileUrl(filePath.toString()) // Lokal dosya yolu (İleride S3 URL'i olacak)
                    .fileSize(file.getSize()).build();

            document.setId(UUID.randomUUID());
            document.setCreatedAt(Instant.now());

            // 5. İsteğe bağlı ilişkileri (Property, User, Request) bağla
            if (propertyId != null) {
                Property property = propertyRepository.findById(propertyId).orElse(null);
                document.setProperty(property);
            }
            if (userId != null) {
                User user = userRepository.findById(userId).orElse(null);
                document.setUser(user);
            }
            if (requestId != null) {
                MaintenanceRequest request = maintenanceRepository.findById(requestId).orElse(null);
                document.setMaintenanceRequest(request);
            }

            // 6. Veritabanına kaydet
            Document savedDocument = documentRepository.save(document);

            // 7. Yanıt dön
            return DocumentResponseDTO.builder().documentId(savedDocument.getId()).fileName(savedDocument.getFileName()).fileType(savedDocument.getFileType()).fileUrl(savedDocument.getFileUrl()).fileSize(savedDocument.getFileSize()).createdAt(savedDocument.getCreatedAt()).build();

        } catch (IOException e) {
            throw new RuntimeException("Dosya yüklenirken bir hata oluştu: " + e.getMessage());
        }
    }


    // Dosyayı sistemden güvenli bir şekilde Resource olarak okuyan metot
    public Resource downloadDocument(UUID documentId) {
        Document document = documentRepository.findById(documentId).orElseThrow(() -> new RuntimeException("Belge bulunamadı!"));

        try {
            Path filePath = Paths.get(document.getFileUrl());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Dosya diskte bulunamadı veya okunabilir değil!");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Dosya yolu dönüştürülürken hata oluştu: " + e.getMessage());
        }
    }

    // Controller tarafında dosya türünü (Mime Type) set edebilmek için belgenin kendisini bulan küçük bir yardımcı metot
    public Document getDocumentById(UUID documentId) {
        return documentRepository.findById(documentId).orElseThrow(() -> new RuntimeException("Belge bulunamadı!"));
    }
}