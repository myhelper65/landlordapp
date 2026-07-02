package com.property.platform.controller;

import com.property.platform.dto.request.InvoiceRequestDTO;
import com.property.platform.dto.response.InvoiceResponseDTO;
import com.property.platform.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // React ile haberleşmek için eklendi
public class InvoiceController {

    private final InvoiceService invoiceService;

    // ==========================================
    // 1. MEVCUT ENDPOINT'LERİN (HİÇ DOKUNULMADI)
    // ==========================================
    
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping
    public ResponseEntity<InvoiceResponseDTO> createInvoice(@RequestBody InvoiceRequestDTO request) {
        InvoiceResponseDTO response = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
//
//    @PutMapping("/{invoiceId}/pay")
//    public ResponseEntity<InvoiceResponseDTO> payInvoice(@PathVariable UUID invoiceId) {
//        InvoiceResponseDTO response = invoiceService.payInvoice(invoiceId);
//        return ResponseEntity.ok(response);
//    }

    // ==========================================
    // 2. YENİ EKLENEN REACT UI ENDPOINT'LERİ
    // ==========================================

    @GetMapping
    public List<InvoiceResponseDTO> getAllInvoices() {
        // BURASI ÇOK ÖNEMLİ: Eğer burada findAll() dersen silinenler de gelir!
        return invoiceService.getAllInvoices();
    }

    @GetMapping("/tenant")
    public ResponseEntity<List<InvoiceResponseDTO>> getMyInvoices() {
        return ResponseEntity.ok(invoiceService.getMyInvoices());
    }

    // Arayüzdeki "Edit" formu için
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponseDTO> updateInvoice(
            @PathVariable UUID invoiceId, 
            @RequestBody InvoiceRequestDTO request) {
        InvoiceResponseDTO response = invoiceService.updateInvoice(invoiceId, request);
        return ResponseEntity.ok(response);
    }

    // Arayüzdeki "Delete" butonu için
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/{invoiceId}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID invoiceId) {
        invoiceService.deleteInvoice(invoiceId);
        return ResponseEntity.noContent().build();
    }

    // Arayüzdeki "Geçmiş (Transaction History)" ikonu için
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<InvoiceResponseDTO>> getPropertyHistory(@PathVariable UUID propertyId) {
        List<InvoiceResponseDTO> responses = invoiceService.getPropertyHistory(propertyId);
        return ResponseEntity.ok(responses);
    }
    @PutMapping("/{id}/pay")
    public ResponseEntity<InvoiceResponseDTO> payInvoice(@PathVariable UUID id) {
        return ResponseEntity.ok(invoiceService.payInvoice(id));
    }

}