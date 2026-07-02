package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "property_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyDocument extends BaseEntity {

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type", nullable = false)
    private String fileType; // Örn: application/pdf

    @Column(name = "file_url", nullable = false)
    private String fileUrl; // React tarafına göndereceğimiz erişim linki

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}