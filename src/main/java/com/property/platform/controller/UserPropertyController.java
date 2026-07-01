package com.property.platform.controller;

import com.property.platform.dto.request.PropertyAssignmentRequestDTO;
import com.property.platform.dto.response.PropertyAssignmentResponseDTO;
import com.property.platform.service.UserPropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/property-assignments")
@RequiredArgsConstructor
public class UserPropertyController {

    private final UserPropertyService userPropertyService;

    @PostMapping
    public ResponseEntity<PropertyAssignmentResponseDTO> assignUser(@RequestBody PropertyAssignmentRequestDTO request) {
        PropertyAssignmentResponseDTO response = userPropertyService.assignUserToProperty(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}