package com.property.platform.dto.request;

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
public class InvoiceRequestDTO {
    // --- MEVCUT ALANLARIN (HİÇBİRİ SİLİNMEDİ) ---
    private UUID propertyId;
    private UUID userId;
    private BigDecimal amount;
    private InvoiceType type;
    private LocalDate dueDate;
    private String notes;

    // --- REACT UI EKLENTİSİ ---
    // Formdan Admin'in girdiği "UNPAID", "PAID" vs. bilgisini almak için eklendi
    private InvoiceStatus status; 
}