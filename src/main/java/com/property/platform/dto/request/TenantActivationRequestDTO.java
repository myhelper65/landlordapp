package com.property.platform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TenantActivationRequestDTO {
    private String token;
    private String newPassword;
    private boolean termsAccepted;
}
