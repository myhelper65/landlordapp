package com.property.platform.dto.request;

import lombok.Data;

@Data
public class ResetPasswordRequestDTO {
    private String token;
    private String newPassword;
}
