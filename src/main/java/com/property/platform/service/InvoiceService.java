package com.property.platform.service;

import com.property.platform.dto.request.InvoiceRequestDTO;
import com.property.platform.dto.response.InvoiceResponseDTO;
import com.property.platform.entity.Invoice;
import com.property.platform.entity.Property;
import com.property.platform.entity.User;
import com.property.platform.repository.InvoiceRepository;
import com.property.platform.repository.PropertyRepository;
import com.property.platform.repository.UserPropertyRepository;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final UserPropertyRepository userPropertyRepository;




    public InvoiceResponseDTO createInvoice(InvoiceRequestDTO request) {

        // 1. Daire ID'si boş mu diye kontrol et (İlk patlamayı önle)
        if (request.getPropertyId() == null) {
            throw new IllegalArgumentException("Hata: Daire seçimi yapılmadı (Property ID eksik).");
        }

        // 2. Mülkü Bul
        Property property = propertyRepository.findByIdAndIsDeletedFalse(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Mülk bulunamadı!"));

        User user;

        // 3. Kullanıcıyı Bul (UI'dan gelmiyorsa otomatik bul)
        if (request.getUserId() == null) {
            // Formda kiracı seçilmemişse, bu daireye atanmış aktif kiracıyı bul
            user = userPropertyRepository.findByPropertyIdAndIsDeletedFalse(property.getId())
                    .stream()
                    .findFirst() // İlk aktif atamayı al
                    .map(up -> up.getUser())
                    .orElseThrow(() -> new RuntimeException("Hata: Bu daireye atanmış aktif bir kiracı yok. Fatura kesilemez!"));
        } else {
            // Eğer UI üzerinden spesifik bir userId geliyorsa onu bul
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));

            // İş Kuralı Kontrolü: Bu kullanıcı bu mülke kayıtlı mı?
            boolean isAssociated = userPropertyRepository.findByPropertyIdAndIsDeletedFalse(property.getId())
                    .stream()
                    .anyMatch(up -> up.getUser().getId().equals(user.getId()));

            if (!isAssociated) {
                throw new RuntimeException("Hata: Bu kullanıcı belirtilen mülk ile ilişkilendirilmemiş. Fatura kesilemez!");
            }
        }

        // 4. Faturayı Oluştur
        Invoice invoice = Invoice.builder()
                .property(property)
                .user(user)
                .amount(request.getAmount())
                .type(request.getType())
                .status(request.getStatus() != null ? request.getStatus() : Invoice.InvoiceStatus.UNPAID)
                .dueDate(request.getDueDate())
                .notes(request.getNotes())
                .build();

        invoice.setId(UUID.randomUUID());
        invoice.setCreatedAt(Instant.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 5. Yanıt Döndür
        return mapToResponseDTO(savedInvoice); // Aşağıdaki yardımcı metodu kullandık, kod tekrarını önledik
    }
//    public InvoiceResponseDTO createInvoice(InvoiceRequestDTO request) {
//
//        // 1. Mülk ve Kullanıcıyı Bul
//        Property property = propertyRepository.findByIdAndIsDeletedFalse(request.getPropertyId())
//                .orElseThrow(() -> new RuntimeException("Mülk bulunamadı!"));
//
//        User user = userRepository.findById(request.getUserId())
//                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı!"));
//
//        // 2. İş Kuralı Kontrolü: Bu kullanıcı bu mülke kayıtlı mı? (Kiracı, Ev Sahibi vs.)
//        boolean isAssociated = userPropertyRepository.findByPropertyIdAndIsDeletedFalse(property.getId())
//                .stream()
//                .anyMatch(up -> up.getUser().getId().equals(user.getId()));
//
//        if (!isAssociated) {
//            throw new RuntimeException("Hata: Bu kullanıcı belirtilen mülk ile ilişkilendirilmemiş. Fatura kesilemez!");
//        }
//
//        // 3. Faturayı Oluştur
//        Invoice invoice = Invoice.builder()
//                .property(property)
//                .user(user)
//                .amount(request.getAmount())
//                .type(request.getType())
//                .status(Invoice.InvoiceStatus.UNPAID) // Yeni fatura her zaman ödenmemiş başlar
//                .dueDate(request.getDueDate())
//                .notes(request.getNotes())
//                .build();
//
//        invoice.setId(UUID.randomUUID());
//        invoice.setCreatedAt(Instant.now());
//
//        Invoice savedInvoice = invoiceRepository.save(invoice);
//
//        // 4. Yanıt Döndür
//        return InvoiceResponseDTO.builder()
//                .invoiceId(savedInvoice.getId())
//                .propertyId(property.getId())
//                .unitNumber(property.getUnitNumber())
//                .userId(user.getId())
//                .userEmail(user.getEmail())
//                .amount(savedInvoice.getAmount())
//                .type(savedInvoice.getType())
//                .status(savedInvoice.getStatus())
//                .dueDate(savedInvoice.getDueDate())
//                .notes(savedInvoice.getNotes())
//                .build();
//    }

    // Faturayı ödendi olarak işaretleyen metot
    public InvoiceResponseDTO payInvoice(UUID invoiceId) {

        // 1. Faturayı veritabanından bul
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Belirtilen fatura bulunamadı!"));

        // 2. İş Kuralı: Fatura zaten ödenmiş mi?
        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new RuntimeException("Bu fatura zaten ödenmiş!");
        }

        // 3. Durumu güncelle
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setUpdatedAt(Instant.now());

        // 4. Veritabanına kaydet
        Invoice updatedInvoice = invoiceRepository.save(invoice);

        // 5. Güncel halini DTO olarak dön
        return InvoiceResponseDTO.builder()
                .invoiceId(updatedInvoice.getId())
                .propertyId(updatedInvoice.getProperty().getId())
                .unitNumber(updatedInvoice.getProperty().getUnitNumber())
                .userId(updatedInvoice.getUser().getId())
                .userEmail(updatedInvoice.getUser().getEmail())
                .amount(updatedInvoice.getAmount())
                .type(updatedInvoice.getType())
                .status(updatedInvoice.getStatus())
                .dueDate(updatedInvoice.getDueDate())
                .notes(updatedInvoice.getNotes())
                .build();
    }


    // ==========================================
    // REACT UI İÇİN EKLENEN YENİ SERVİS METOTLARI
    // ==========================================

    public List<InvoiceResponseDTO> getAllInvoices() {
        // Senin paylaştığın kodda zaten bu doğru:
        return invoiceRepository.findAllByIsDeletedFalseOrderByDueDateDesc()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponseDTO> getMyInvoices() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        User tenant = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return invoiceRepository.findByUserIdAndIsDeletedFalse(tenant.getId())
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // 2. Faturayı güncelle (Edit formu için)
    public InvoiceResponseDTO updateInvoice(UUID invoiceId, InvoiceRequestDTO request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Gelen yeni değerleri faturaya setle
        invoice.setType(request.getType());
        invoice.setNotes(request.getNotes());
        invoice.setAmount(request.getAmount());
        invoice.setDueDate(request.getDueDate());

        if (request.getStatus() != null) {
            invoice.setStatus(request.getStatus());
        }

        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapToResponseDTO(updatedInvoice);
    }

    // InvoiceService.java
    public void deleteInvoice(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        invoice.setDeleted(true); // Flag'i true yap
        invoiceRepository.save(invoice); // <-- BU SATIR ÇOK ÖNEMLİ, KAYDETMİYORSAN SİLİNMEZ!
    }
    // 4. Dairenin işlem geçmişini getir
    public List<InvoiceResponseDTO> getPropertyHistory(UUID propertyId) {
        return invoiceRepository.findByPropertyIdAndIsDeletedFalseOrderByDueDateDesc(propertyId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ==========================================
    // YARDIMCI METOT (ENTITY -> DTO ÇEVİRİCİ)
    // ==========================================
    private InvoiceResponseDTO mapToResponseDTO(Invoice invoice) {
        // Daire adını ve Kiracı adını birleştiriyoruz
        String propertyName = invoice.getProperty().getCommunity().getName() + " - " + invoice.getProperty().getUnitNumber();
        String tenantName = invoice.getUser().getFirstName() + " " + invoice.getUser().getLastName();

        // React'taki Description alanı için Type ve Notes'u birleştiriyoruz
        String descriptionStr = invoice.getType().name() + (invoice.getNotes() != null ? " - " + invoice.getNotes() : "");

        return InvoiceResponseDTO.builder()
                .id(invoice.getId()) // React tablosu için
                .invoiceId(invoice.getId())
                .propertyId(invoice.getProperty().getId())
                .propertyName(propertyName)
                .unitNumber(invoice.getProperty().getUnitNumber())
                .userId(invoice.getUser().getId())
                .userEmail(invoice.getUser().getEmail())
                .tenantName(tenantName)
                .amount(invoice.getAmount())
                .type(invoice.getType())
                .status(invoice.getStatus())
                .dueDate(invoice.getDueDate())
                .notes(invoice.getNotes())
                .description(descriptionStr)
                .build();
    }
}