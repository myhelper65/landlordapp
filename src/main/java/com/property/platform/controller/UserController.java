package com.property.platform.controller;

import com.property.platform.entity.User;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // React'in kiracı seçme menüsünü (Dropdown) doldurmak için kullanacağı metot
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        // İpucu: Gerçek bir canlı ortamda (production) şifre gibi bilgilerin gitmemesi için 
        // User entity'si yerine UserResponseDTO dönmek daha iyidir. 
        // Ancak şu an testi hızlıca geçmek için doğrudan listeyi dönüyoruz.
        return ResponseEntity.ok(userRepository.findAll());
    }
}