package com.property.platform.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PaymentRequest {
    @NotNull(message = "Invoice ID is required")
    private UUID invoiceId;

    @NotNull(message = "Payment Method ID is required")
    private UUID paymentMethodId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotBlank(message = "Idempotency key is required to prevent duplicate charges")
    private String idempotencyKey;
}