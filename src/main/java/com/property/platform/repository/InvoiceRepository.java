package com.property.platform.repository;

import com.property.platform.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    // --- MEVCUT METOTLARIN ---
    List<Invoice> findByUserIdAndIsDeletedFalse(UUID userId);
    List<Invoice> findByPropertyIdAndIsDeletedFalse(UUID propertyId);
    List<Invoice> findByStatusAndIsDeletedFalse(Invoice.InvoiceStatus status);

    @Query("SELECT SUM(i.amount) FROM Invoice i WHERE i.status IN ('UNPAID', 'OVERDUE') AND i.isDeleted = false")
    BigDecimal sumUnpaidInvoices();

    @Query("SELECT SUM(i.amount) FROM Invoice i WHERE i.status = 'PAID' AND i.isDeleted = false")
    BigDecimal sumPaidInvoices();

    // --- REACT UI İÇİN EKLENEN YENİ METOTLAR (SADECE BİRER TANE) ---
    List<Invoice> findAllByIsDeletedFalseOrderByDueDateDesc();
    List<Invoice> findAllByIsDeletedFalse();
    List<Invoice> findByPropertyIdAndIsDeletedFalseOrderByDueDateDesc(UUID propertyId);
    List<Invoice> findAllByUserIdAndStatusOrderByDueDateAsc(UUID userId, Invoice.InvoiceStatus status);

    List<Invoice> findAllByUserIdAndStatusAndIsDeletedFalseOrderByDueDateAsc(UUID userId, Invoice.InvoiceStatus status);


        Optional<Invoice> findByIdAndUserIdAndIsDeletedFalse(UUID invoiceId, UUID userId);


    }
