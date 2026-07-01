package com.property.platform.service;

import com.property.platform.dto.request.LoginRequestDTO;
import com.property.platform.dto.response.AuthResponseDTO;
import com.property.platform.repository.UserRepository;
import com.property.platform.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthResponseDTO login(LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return AuthResponseDTO.builder()
                .token(jwtToken)
                .id(user.getId())       // BU SATIR ÖNEMLİ (FRONTEND İÇİN)
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponseDTO register(com.property.platform.dto.request.RegisterRequestDTO request) {

        // 1. Postman'dan gelen rolü güvenli bir şekilde belirle
        com.property.platform.entity.User.UserRole userRole;
        try {
            // Eğer rol boş veya null gelirse varsayılan olarak TENANT ata
            String roleStr = (request.getRole() != null && !request.getRole().trim().isEmpty())
                    ? request.getRole().toUpperCase()
                    : "TENANT";
            userRole = com.property.platform.entity.User.UserRole.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            // Yanlış veya eşleşmeyen bir kelime gönderilirse sistemi çökertme, TENANT yap
            userRole = com.property.platform.entity.User.UserRole.TENANT;
        }

        // 2. Yeni kullanıcıyı oluştur (Sabit değil, dinamik rol ile)
        var user = com.property.platform.entity.User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole) // DİNAMİK ROL ATAMASI
                .build();

        // 3. Kullanıcıyı veritabanına kaydet
        userRepository.save(user);

        // 4. Token üret
        var jwtToken = jwtService.generateToken(user);

        // 5. AuthResponseDTO'yu Builder ile dönüyoruz
        return AuthResponseDTO.builder()
                .token(jwtToken)
                .id(user.getId()) // Kayıt sonrası ID dönmesi React için gereklidir
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}























//package com.property.platform.service;
//
//import com.property.platform.dto.request.LoginRequestDTO;
//import com.property.platform.dto.response.AuthResponseDTO;
//import com.property.platform.repository.UserRepository;
//import com.property.platform.security.JwtService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.authentication.AuthenticationManager;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class AuthService {
//
//    private final UserRepository userRepository;
//    private final JwtService jwtService;
//    private final AuthenticationManager authenticationManager;
//    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
//    public AuthResponseDTO login(LoginRequestDTO request) {
//        authenticationManager.authenticate(
//                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
//                        request.getEmail(),
//                        request.getPassword()
//                )
//        );
//
//        var user = userRepository.findByEmail(request.getEmail()).orElseThrow();
//        var jwtToken = jwtService.generateToken(user);
//
//        return AuthResponseDTO.builder()
//                .token(jwtToken)
//                .id(user.getId())       // BU SATIRI EKLE
//                .email(user.getEmail())
//                .role(user.getRole().name())
//                .build();
//    }
//
//    public AuthResponseDTO register(com.property.platform.dto.request.RegisterRequestDTO request) {
//        // 1. Yeni kullanıcıyı oluştur (Class yapısı olduğu için getMetodu kullanıyoruz)
//        var user = com.property.platform.entity.User.builder()
//                .firstName(request.getFirstName())
//                .lastName(request.getLastName())
//                .email(request.getEmail())
//                .password(passwordEncoder.encode(request.getPassword()))
//                .role(com.property.platform.entity.User.UserRole.TENANT)
//                .build();
//
//        // 2. Kullanıcıyı veritabanına kaydet
//        userRepository.save(user);
//
//        // 3. Token üret
//        var jwtToken = jwtService.generateToken(user);
//
//        // 4. AuthResponseDTO'yu Builder ile dönüyoruz
//        return AuthResponseDTO.builder()
//                .token(jwtToken)
//                .email(user.getEmail())
//                .role(user.getRole().name()) // Eğer User entity'sinde role null ise burası hata verebilir, default bir rol ataması yapıldığından emin olun.
//                .build();
//    }
//}