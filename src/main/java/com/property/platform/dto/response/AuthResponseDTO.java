package com.property.platform.dto.response;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {
    private UUID id;      // EKSİK OLAN PARÇA BUYDU!
    private String token;
    private String email;
    private String role;
    private boolean firstLoginRequired;
}