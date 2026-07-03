package com.property.platform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodRequestDTO {
    private String cardholderName;
    private String cardNumber;
    private String expiryDate;
    private String cvc;
    private String type; // CARD or ACH
}
