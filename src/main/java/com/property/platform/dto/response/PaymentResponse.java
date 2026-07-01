package com.property.platform.dto.response;

import com.property.platform.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {
    private UUID id;
    private String confirmationNumber;
    private PaymentStatus status;
    private BigDecimal amount;
    private LocalDateTime processedAt;
    private String receiptUrl;
}