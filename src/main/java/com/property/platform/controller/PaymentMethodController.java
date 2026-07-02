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
    public ResponseEntity<PaymentMethod> addPaymentMethod(@RequestBody PaymentMethod request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User tenant = userRepository.findByEmail(email).orElseThrow();
        
        request.setUser(tenant);
        // Ensure id is null so a new one is generated
        request.setId(null);
        request.setDeleted(false);
        
        return ResponseEntity.ok(paymentMethodRepository.save(request));
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