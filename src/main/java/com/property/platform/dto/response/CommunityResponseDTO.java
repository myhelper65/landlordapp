package com.property.platform.dto.response;

import lombok.*;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityResponseDTO {
    private UUID id;
    private String name;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String description;
}