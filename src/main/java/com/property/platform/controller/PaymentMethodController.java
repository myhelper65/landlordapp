package com.property.platform.controller;

import com.property.platform.entity.PaymentMethod;
import com.property.platform.repository.PaymentMethodRepository;
import com.property.platform.entity.User;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.property.platform.entity.PaymentMethod;
import com.property.platform.entity.User;
import com.property.platform.repository.PaymentMethodRepository;
import com.property.platform.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodRepository paymentMethodRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getMyPaymentMethods() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User tenant = userRepository.findByEmail(email).orElseThrow();
        
        // Strictly isolated to the logged-in tenant
        return ResponseEntity.ok(paymentMethodRepository.findAllByUserIdAndIsDeletedFalse(tenant.getId()));
    }

    @PostMapping
    public ResponseEntity<PaymentMethod> addPaymentMethod(@RequestBody com.property.platform.dto.request.PaymentMethodRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User tenant = userRepository.findByEmail(email).orElseThrow();

        // MOCK: Generate fake token and extract last4
        String last4 = request.getCardNumber() != null && request.getCardNumber().length() >= 4 
                ? request.getCardNumber().substring(request.getCardNumber().length() - 4) 
                : "0000";
        
        // Mock simple brand detection
        String brand = "Visa";
        if (request.getCardNumber() != null && request.getCardNumber().startsWith("5")) {
            brand = "Mastercard";
        } else if (request.getCardNumber() != null && request.getCardNumber().startsWith("3")) {
            brand = "Amex";
        }

        PaymentMethod newMethod = PaymentMethod.builder()
                .user(tenant)
                .gatewayToken("mock_tok_" + java.util.UUID.randomUUID().toString().substring(0, 8))
                .type(request.getType() != null ? request.getType() : "CARD")
                .brand(brand)
                .last4(last4)
                .isDefault(false)
                .build();
        newMethod.setId(java.util.UUID.randomUUID());

        return ResponseEntity.ok(paymentMethodRepository.save(newMethod));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable UUID id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User tenant = userRepository.findByEmail(email).orElseThrow();
        
        PaymentMethod method = paymentMethodRepository.findByIdAndUserIdAndIsDeletedFalse(id, tenant.getId())
                .orElseThrow(() -> new RuntimeException("Method not found or access denied"));
                
        method.setDeleted(true);
        paymentMethodRepository.save(method);
        
        return ResponseEntity.noContent().build();
    }
}