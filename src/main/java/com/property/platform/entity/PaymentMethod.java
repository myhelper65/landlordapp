package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.util.UUID;

@Entity
@Table(name = "payment_methods")
@SQLDelete(sql = "UPDATE payment_methods SET is_deleted = true WHERE id = ?")
@Where(clause = "is_deleted = false")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String gatewayToken; // e.g., "pm_1Nkjdf8..." from Stripe

    @Column(nullable = false, length = 20)
    private String type; // CARD, ACH

    @Column(length = 50)
    private String brand; // Visa, Mastercard, Chase Checking

    @Column(name = "last_four", length = 4, nullable = false)
    private String last4;

    private boolean isDefault;
    
    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;
}