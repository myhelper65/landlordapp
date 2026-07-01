package com.property.platform.service;

import com.opencsv.CSVWriter;
import com.property.platform.entity.Invoice;
import com.property.platform.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final InvoiceRepository invoiceRepository;

    public ByteArrayInputStream generateUnpaidInvoicesReport() {
        // 1. Ödenmemiş ve silinmemiş tüm faturaları veritabanından çek
        List<Invoice> unpaidInvoices = invoiceRepository.findByStatusAndIsDeletedFalse(Invoice.InvoiceStatus.UNPAID);

        // 2. CSV oluşturmak için bellekte bir alan aç
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // 3. CSV dosyasında Türkçe karakter sorunu olmasın diye UTF-8 BOM ekle (İsteğe bağlı ama önerilir)
        try {
            out.write(239);
            out.write(187);
            out.write(191);
        } catch (Exception e) {
            throw new RuntimeException("CSV BOM karakteri yazılamadı", e);
        }

        // 4. OpenCSV Writer'ı başlat
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
            
            // 5. Excel'in ilk satırı (Başlıklar)
            String[] headers = {
                    "Fatura ID",
                    "Kullanici E-Posta",
                    "Daire No",
                    "Tutar",
                    "Fatura Tipi",
                    "Son Odeme Tarihi"
            };
            writer.writeNext(headers);

            // 6. Verileri döngüyle satır satır yazdır
            for (Invoice invoice : unpaidInvoices) {
                String[] data = {
                        invoice.getId().toString(),
                        invoice.getUser() != null ? invoice.getUser().getEmail() : "Bilinmiyor",
                        invoice.getProperty() != null ? invoice.getProperty().getUnitNumber() : "Bilinmiyor",
                        invoice.getAmount().toString(),
                        invoice.getType().toString(),
                        invoice.getDueDate().toString()
                };
                writer.writeNext(data);
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV Raporu olusturulurken hata meydana geldi: " + e.getMessage());
        }

        // 7. Oluşan dosyayı indirilmeye hazır (Stream) formatta geri dön
        return new ByteArrayInputStream(out.toByteArray());
    }
}