package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.math.BigDecimal;

@Entity
@Table(name = "payments")
// BaseEntity'de zaten @SQLRestriction("is_deleted = false") var, 
// o yüzden buraya sadece Delete işleminin nasıl yapılacağını söylüyoruz:
@SQLDelete(sql = "UPDATE payments SET is_deleted = true WHERE id = ?")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Column(name = "confirmation_number", nullable = false, unique = true, updatable = false)
    private String confirmationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_method_id")
    private PaymentMethod paymentMethod;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    @Column(name = "gateway_transaction_id")
    private String gatewayTransactionId; // Stripe, İyzico vb. sistemlerden dönen gerçek işlem ID'si
    
    @Column(name = "idempotency_key", unique = true)
    private String idempotencyKey; // Çift çekimi (mükerrer ödemeyi) engellemek için güvenlik anahtarı
}