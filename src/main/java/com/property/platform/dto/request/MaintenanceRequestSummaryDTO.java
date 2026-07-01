package com.property.platform.dto.request;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestSummaryDTO {
    private String title;
    private String status;
    private LocalDate reportedOn;
}