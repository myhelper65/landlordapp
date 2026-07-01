package com.property.platform.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.property.platform.entity.Payment;
import com.property.platform.entity.User;
import com.property.platform.repository.PaymentRepository;
import com.property.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.itextpdf.text.Document;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public ByteArrayInputStream generatePaymentReceipt(UUID paymentId) {
        // 1. Güvenlik: Oturum açan kullanıcıyı bul
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User tenant = userRepository.findByEmail(email).orElseThrow();

        // 2. Güvenlik: Sadece bu kiracıya ait ve silinmemiş ödemeyi bul
        Payment payment = paymentRepository.findById(paymentId)
                .filter(p -> p.getTenant().getId().equals(tenant.getId()) && !p.isDeleted())
                .orElseThrow(() -> new RuntimeException("Ödeme bulunamadı veya erişim yetkiniz yok!"));

        // 3. PDF Oluşturma Başlıyor
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Şirket Başlığı
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.DARK_GRAY);
            Paragraph title = new Paragraph("PAYMENT RECEIPT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(30);
            document.add(title);

            // Ödeme Detayları Tablosu
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            
            addTableRow(table, "Confirmation Number:", payment.getConfirmationNumber(), headFont);
            addTableRow(table, "Date & Time:", payment.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm a")), headFont);            addTableRow(table, "Amount Paid:", "$" + payment.getAmount().toString(), headFont);
            addTableRow(table, "Payment Method:", payment.getPaymentMethod().getBrand() + " ending in " + payment.getPaymentMethod().getLast4(), headFont);
            addTableRow(table, "Status:", payment.getStatus().name(), headFont);
            addTableRow(table, "Property:", payment.getInvoice().getProperty().getCommunity().getName() + " - " + payment.getInvoice().getProperty().getUnitNumber(), headFont);
            addTableRow(table, "Paid By:", tenant.getFirstName() + " " + tenant.getLastName(), headFont);

            document.add(table);

            // Alt Bilgi
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY);
            Paragraph footer = new Paragraph("Thank you for your payment. Keep this receipt for your records.", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(50);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF Makbuz oluşturulurken hata meydana geldi: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private void addTableRow(PdfPTable table, String header, String value, Font font) {
        PdfPCell hCell = new PdfPCell(new Phrase(header, font));
        hCell.setBorder(Rectangle.NO_BORDER);
        hCell.setPaddingBottom(10);
        table.addCell(hCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value));
        vCell.setBorder(Rectangle.NO_BORDER);
        vCell.setPaddingBottom(10);
        table.addCell(vCell);
    }
}