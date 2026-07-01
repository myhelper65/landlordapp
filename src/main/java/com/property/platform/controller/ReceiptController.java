package com.property.platform.controller;

import com.property.platform.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/receipts")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    @GetMapping("/{paymentId}/download")
    public ResponseEntity<Resource> downloadReceipt(@PathVariable UUID paymentId) {
        ByteArrayInputStream pdfStream = receiptService.generatePaymentReceipt(paymentId);
        InputStreamResource file = new InputStreamResource(pdfStream);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receipt_" + paymentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}