package com.property.platform.controller;

import com.property.platform.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROPERTY_MANAGER')")
    @GetMapping("/unpaid-invoices")
    public ResponseEntity<Resource> downloadUnpaidInvoices() {

        // Servisten CSV verisini belleğe al
        ByteArrayInputStream in = reportService.generateUnpaidInvoicesReport();
        InputStreamResource resource = new InputStreamResource(in);

        // Tarayıcıya bunun indirilebilir bir "CSV" dosyası olduğunu söyle
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=odenmemis_faturalar_raporu.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(resource);
    }
}