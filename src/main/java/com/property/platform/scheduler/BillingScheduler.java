package com.property.platform.scheduler;

import com.property.platform.entity.Invoice;
import com.property.platform.entity.UserProperty;
import com.property.platform.repository.InvoiceRepository;
import com.property.platform.repository.UserPropertyRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BillingScheduler {

    // Konsola log (bilgi) yazdırmak için
    private static final Logger log = LoggerFactory.getLogger(BillingScheduler.class);
    
    private final UserPropertyRepository userPropertyRepository;
    private final InvoiceRepository invoiceRepository;

    // "0 * * * * *" ifadesi Cron diliyle "Her dakikanın 0. saniyesinde çalış" demektir. test icin yap
    // Canlıya alırken bunu "0 0 0 1 * ?" (Her ayın 1'i gece yarısı) olarak değiştireceğiz.
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void generateMonthlyInvoices() {
        log.info("⏳ Otomatik fatura kesim robotu uyandı ve süreci başlattı...");

        // 1. Sistemdeki tüm aktif kiracı/sahip kayıtlarını bul
        List<UserProperty> activeAssignments = userPropertyRepository.findByIsDeletedFalse();
        int generatedCount = 0;

        // 2. Her biri için otomatik fatura oluştur
        for (UserProperty assignment : activeAssignments) {
            
            Invoice invoice = Invoice.builder()
                    .property(assignment.getProperty())
                    .user(assignment.getUser())
                    .amount(new BigDecimal("500.00")) // Sabit aidat tutarı (Test amaçlı)
                    .type(Invoice.InvoiceType.HOA_DUES) // Aidat tipi
                    .status(Invoice.InvoiceStatus.UNPAID)
                    .dueDate(LocalDate.now().plusDays(10)) // Son ödeme tarihi 10 gün sonra
                    .notes("Otomatik Sistem Tarafından Kesilen Aylık Aidat Faturası")
                    .build();

            invoice.setId(UUID.randomUUID());
            invoice.setCreatedAt(Instant.now());
            
            invoiceRepository.save(invoice);
            generatedCount++;
        }

        log.info("✅ Fatura kesim süreci tamamlandı. Toplam {} adet fatura otomatik oluşturuldu.", generatedCount);
    }
}