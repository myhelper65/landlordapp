package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice extends BaseEntity {



    // Sınıfın üstüne ekle
    @SQLDelete(sql = "UPDATE invoices SET is_deleted = true WHERE id = ?")
    @Where(clause = "is_deleted = false")

// Alanlara ekle
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Faturanın kesildiği kişi (Tenant/Owner)

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus status;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate; // Son ödeme tarihi

    private String notes;

    public enum InvoiceType {
        RENT, HOA_DUES, WATER, ELECTRICITY, MAINTENANCE_FEE
    }

    public enum InvoiceStatus {
        UNPAID, PAID, OVERDUE, CANCELLED
    }



}