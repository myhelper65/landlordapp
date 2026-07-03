package com.property.platform.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSetupRequestDTO {
    private String currentPassword;
    private String newPassword;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
}
