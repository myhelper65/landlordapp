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


    // @SQLDelete and @Where commented out or removed because BaseEntity has @SQLRestriction("is_deleted = false")
    // and they conflict or cause errors with Spring Data JPA updates if not handled correctly.
    // Also removed duplicate isDeleted field.
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