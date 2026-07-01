package com.property.platform.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityRequestDTO {
    private String name;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private String description;
}