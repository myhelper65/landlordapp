package com.property.platform.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String role; // Postman'dan gelecek olan rol bilgisi

    // LOMBOK TAKILMALARINA KARŞI MANUEL GARANTİ
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}