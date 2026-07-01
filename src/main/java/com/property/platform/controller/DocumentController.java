package com.property.platform.controller;

import com.property.platform.dto.response.DocumentResponseDTO;
import com.property.platform.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponseDTO> uploadDocument(@RequestParam("file") MultipartFile file, @RequestParam(value = "propertyId", required = false) UUID propertyId, @RequestParam(value = "userId", required = false) UUID userId, @RequestParam(value = "requestId", required = false) UUID requestId) {

        DocumentResponseDTO response = documentService.uploadDocument(file, propertyId, userId, requestId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID documentId) {
        Resource resource = documentService.downloadDocument(documentId);
        com.property.platform.entity.Document docDetails = documentService.getDocumentById(documentId);

        return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, docDetails.getFileType())
                // Tarayıcıda indirmek yerine doğrudan açılmasını isterseniz inline yapabilirsiniz, indirmek için attachment kalabilir
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + docDetails.getFileName() + "\"").body(resource);
    }
}