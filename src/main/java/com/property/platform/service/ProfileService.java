package com.property.platform.service;

import com.property.platform.dto.request.FirstSetupRequestDTO;
import com.property.platform.entity.User;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void completeFirstSetup(String currentUserEmail, FirstSetupRequestDTO request) {
        User user = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isFirstLoginRequired()) {
            throw new RuntimeException("First-time setup already completed");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Check if the new email is different and already taken
        if (!user.getEmail().equalsIgnoreCase(request.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email is already in use");
            }
        }

        // Update fields
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setProfilePictureUrl(request.getProfilePictureUrl());
        
        user.setFirstLoginRequired(false);

        userRepository.save(user);

        log.info("User {} completed first-time setup and changed email to {} (if applicable)", currentUserEmail, request.getEmail());
    }
}
