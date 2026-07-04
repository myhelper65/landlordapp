package com.property.platform.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePasswordRequestDTO {
    @NotBlank
    private String currentPassword;
    
    @NotBlank
    private String newPassword;
}
