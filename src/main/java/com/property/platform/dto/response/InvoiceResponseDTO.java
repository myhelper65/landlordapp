package com.property.platform.dto.response;

import com.property.platform.entity.Invoice.InvoiceStatus;
import com.property.platform.entity.Invoice.InvoiceType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponseDTO {
    // --- MEVCUT ALANLARIN (HİÇBİRİ SİLİNMEDİ) ---
    private UUID invoiceId;
    private UUID propertyId;
    private String unitNumber;
    private UUID userId;
    private String userEmail;
    private BigDecimal amount;
    private InvoiceType type;
    private InvoiceStatus status;
    private LocalDate dueDate;
    private String notes;

    // --- REACT UI İÇİN EKLENEN YENİ ALANLAR ---
    // React tablosu faturanın id'sini, kiracının adını ve daire adını tek satırda görmek istiyor.
    // Service katmanında bunları maplerken dolduracağız.
    private UUID id;              // React "id" adında bir field bekliyor (invoiceId ile aynı olacak)
    private String tenantName;    // Örn: "John Doe"
    private String propertyName;  // Örn: "TURKUAZ - A45"
    private String description;   // Örn: "RENT - Haziran Kirası"


}