package com.property.platform.dto.response;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponseDTO {
    private UUID documentId;
    private String fileName;
    private String fileType;
    private String fileUrl;
    private Long fileSize;
    private Instant createdAt;
}