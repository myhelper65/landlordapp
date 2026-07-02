package com.property.platform.dto.response;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDTO {
    private UUID id;
    private String fileName;
    private String fileType;
    private String fileUrl;



}