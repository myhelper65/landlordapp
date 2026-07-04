package com.property.platform.service;

import com.property.platform.dto.request.MaintenanceRequestSummaryDTO;
import com.property.platform.dto.response.DashboardSummaryDTO;
import com.property.platform.dto.response.TenantDashboardResponseDTO;
import com.property.platform.entity.*;
import com.property.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CommunityRepository communityRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final MaintenanceRequestRepository maintenanceRepository;
    private final InvoiceRepository invoiceRepository;

    private final UserPropertyRepository userPropertyRepository;

    public DashboardSummaryDTO getSystemSummary() {
        long totalCommunities = communityRepository.countByIsDeletedFalse();
        long totalProperties = propertyRepository.countByIsDeletedFalse();
        long totalUsers = userRepository.count();

        BigDecimal unpaidAmount = invoiceRepository.sumUnpaidInvoices();
        if (unpaidAmount == null) unpaidAmount = BigDecimal.ZERO;

        BigDecimal totalRevenue = invoiceRepository.sumPaidInvoices();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        List<MaintenanceRequest.RequestStatus> openStatuses = Arrays.asList(
                MaintenanceRequest.RequestStatus.OPEN,
                MaintenanceRequest.RequestStatus.ASSIGNED,
                MaintenanceRequest.RequestStatus.IN_PROGRESS
        );
        long openRequests = maintenanceRepository.countByStatusInAndIsDeletedFalse(openStatuses);

        List<MaintenanceRequest.RequestPriority> highPriorities = Arrays.asList(
                MaintenanceRequest.RequestPriority.HIGH,
                MaintenanceRequest.RequestPriority.URGENT
        );
        long highPriority = maintenanceRepository.countByPriorityInAndStatusInAndIsDeletedFalse(highPriorities, openStatuses);

        long newReq = maintenanceRepository.countByStatusAndIsDeletedFalse(MaintenanceRequest.RequestStatus.OPEN);
        long inProgressReq = maintenanceRepository.countByStatusAndIsDeletedFalse(MaintenanceRequest.RequestStatus.IN_PROGRESS);
        long assignedReq = maintenanceRepository.countByStatusAndIsDeletedFalse(MaintenanceRequest.RequestStatus.ASSIGNED);

        long vacantProperties = propertyRepository.countByStatusAndIsDeletedFalse(Property.PropertyStatus.VACANT);

        int occupancyRate = 0;
        if (totalProperties > 0) {
            long occupiedProperties = totalProperties - vacantProperties;
            occupancyRate = (int) Math.round(((double) occupiedProperties / totalProperties) * 100);
        }

        return DashboardSummaryDTO.builder()
                .totalCommunities(totalCommunities)
                .totalProperties(totalProperties)
                .totalUsers(totalUsers)
                .openMaintenanceRequests(openRequests)
                .totalUnpaidAmount(unpaidAmount)
                .totalRevenue(totalRevenue)
                .highPriorityRequests(highPriority)
                .occupancyRate(occupancyRate)
                .availableUnits(vacantProperties)
                .newRequests(newReq)
                .assignedRequests(assignedReq)
                .inProgressRequests(inProgressReq)
                .build();
    }

    public TenantDashboardResponseDTO getTenantDashboardData() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User tenant = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));

        UserProperty assignment = userPropertyRepository.findByUserIdAndIsDeletedFalse(tenant.getId())
                .stream().findFirst().orElse(null);

        String unitNumber = (assignment != null && assignment.getProperty() != null)
                ? assignment.getProperty().getUnitNumber() : "No Unit Assigned";

        String communityName = (assignment != null && assignment.getProperty() != null && assignment.getProperty().getCommunity() != null)
                ? assignment.getProperty().getCommunity().getName() : "No Community";

        // --- DYNAMIC DATA FETCHING ---

        // 1. Fetch Dynamic Invoice Data (Silinmemiş olanları çeker)
        List<Invoice> unpaidInvoices = invoiceRepository.findAllByUserIdAndStatusAndIsDeletedFalseOrderByDueDateAsc(
                tenant.getId(), Invoice.InvoiceStatus.UNPAID);

        // Toplam borcu hesapla
        BigDecimal totalUnpaid = unpaidInvoices.stream()
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Ödenecek ilk faturanın ID'sini ve tarihini al
        UUID pendingInvoiceId = unpaidInvoices.isEmpty() ? null : unpaidInvoices.get(0).getId();
        LocalDate dueDate = unpaidInvoices.isEmpty() ? null : unpaidInvoices.get(0).getDueDate();

        // 2. Fetch Dynamic Maintenance Requests
        List<MaintenanceRequest.RequestStatus> openStatuses = Arrays.asList(
                MaintenanceRequest.RequestStatus.OPEN,
                MaintenanceRequest.RequestStatus.ASSIGNED,
                MaintenanceRequest.RequestStatus.IN_PROGRESS
        );

        long openRequestsCount = maintenanceRepository.countByUserIdAndStatusInAndIsDeletedFalse(tenant.getId(), openStatuses);

        List<MaintenanceRequestSummaryDTO> recentRequests = maintenanceRepository.findByUserIdAndStatusInAndIsDeletedFalseOrderByCreatedAtDesc(tenant.getId(), openStatuses)
                .stream()
                .limit(3)
                .map(req -> MaintenanceRequestSummaryDTO.builder()
                        .title(req.getTitle())
                        .status(req.getStatus().name())
                        .reportedOn(LocalDate.ofInstant(req.getCreatedAt(), java.time.ZoneId.systemDefault()))
                        .build())
                .collect(Collectors.toList());

        // 3. Hesapla: isSuspended (Daire silinmişse veya inaktifse)
        boolean isSuspended = false;
        if (assignment == null || assignment.getProperty() == null || assignment.getProperty().isDeleted() || assignment.getProperty().getStatus() == Property.PropertyStatus.INACTIVE) {
            isSuspended = true;
        }

        // --- BUILD RESPONSE ---
        return TenantDashboardResponseDTO.builder()
                .firstName(tenant.getFirstName() != null ? tenant.getFirstName() : "Tenant")
                .propertyName(unitNumber)
                .communityName(communityName)
                .nextPaymentDue(totalUnpaid)          // Gerçek borç toplamı
                .dueDate(dueDate)                     // Gerçek son ödeme tarihi
                .currentInvoiceId(pendingInvoiceId)   // Fatura ödeme butonu için eklendi
                .openRequests((int) openRequestsCount)
                .recentMaintenanceRequests(recentRequests)
                .isSuspended(isSuspended)
                .build();
    }
}






















//
//package com.property.platform.service;
//
//import com.property.platform.dto.request.MaintenanceRequestSummaryDTO;
//import com.property.platform.dto.response.DashboardSummaryDTO;
//import com.property.platform.dto.response.TenantDashboardResponseDTO;
//import com.property.platform.entity.*;
//import com.property.platform.repository.*;
//import lombok.RequiredArgsConstructor;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//import java.time.LocalDate;
//import java.util.Arrays;
//import java.util.List;
//
//@Service
//@RequiredArgsConstructor
//public class DashboardService {
//
//    private final CommunityRepository communityRepository;
//    private final PropertyRepository propertyRepository;
//    private final UserRepository userRepository;
//    private final MaintenanceRequestRepository maintenanceRepository;
//    private final InvoiceRepository invoiceRepository;
//
//    // YENİ EKLENEN: Kullanıcının hangi dairede oturduğunu bulmak için
//    private final UserPropertyRepository userPropertyRepository;
//
//    // --- MEVCUT ADMİN METODU (DOKUNULMADI) ---
//    public DashboardSummaryDTO getSystemSummary() {
//        long totalCommunities = communityRepository.countByIsDeletedFalse();
//        long totalProperties = propertyRepository.countByIsDeletedFalse();
//        long totalUsers = userRepository.count();
//
//        BigDecimal unpaidAmount = invoiceRepository.sumUnpaidInvoices();
//        if (unpaidAmount == null) unpaidAmount = BigDecimal.ZERO;
//
//        BigDecimal totalRevenue = invoiceRepository.sumPaidInvoices();
//        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
//
//        List<MaintenanceRequest.RequestStatus> openStatuses = Arrays.asList(
//                MaintenanceRequest.RequestStatus.OPEN,
//                MaintenanceRequest.RequestStatus.ASSIGNED,
//                MaintenanceRequest.RequestStatus.IN_PROGRESS
//        );
//        long openRequests = maintenanceRepository.countByStatusInAndIsDeletedFalse(openStatuses);
//
//        List<MaintenanceRequest.RequestPriority> highPriorities = Arrays.asList(
//                MaintenanceRequest.RequestPriority.HIGH,
//                MaintenanceRequest.RequestPriority.URGENT
//        );
//        long highPriority = maintenanceRepository.countByPriorityInAndStatusInAndIsDeletedFalse(highPriorities, openStatuses);
//
//        long newReq = maintenanceRepository.countByStatusAndIsDeletedFalse(MaintenanceRequest.RequestStatus.OPEN);
//        long inProgressReq = maintenanceRepository.countByStatusAndIsDeletedFalse(MaintenanceRequest.RequestStatus.IN_PROGRESS);
//        long assignedReq = maintenanceRepository.countByStatusAndIsDeletedFalse(MaintenanceRequest.RequestStatus.ASSIGNED);
//
//        long vacantProperties = propertyRepository.countByStatusAndIsDeletedFalse(Property.PropertyStatus.VACANT);
//
//        int occupancyRate = 0;
//        if (totalProperties > 0) {
//            long occupiedProperties = totalProperties - vacantProperties;
//            occupancyRate = (int) Math.round(((double) occupiedProperties / totalProperties) * 100);
//        }
//
//        return DashboardSummaryDTO.builder()
//                .totalCommunities(totalCommunities)
//                .totalProperties(totalProperties)
//                .totalUsers(totalUsers)
//                .openMaintenanceRequests(openRequests)
//                .totalUnpaidAmount(unpaidAmount)
//                .totalRevenue(totalRevenue)
//                .highPriorityRequests(highPriority)
//                .occupancyRate(occupancyRate)
//                .availableUnits(vacantProperties)
//                .newRequests(newReq)
//                .assignedRequests(assignedReq)
//                .inProgressRequests(inProgressReq)
//                .build();
//    }
//
//    public TenantDashboardResponseDTO getTenantDashboardData() {
//        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//
//        User tenant = userRepository.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
//
//        UserProperty assignment = userPropertyRepository.findByUserIdAndIsDeletedFalse(tenant.getId())
//                .stream().findFirst().orElse(null);
//
//        String unitNumber = (assignment != null && assignment.getProperty() != null)
//                ? assignment.getProperty().getUnitNumber() : "No Unit Assigned";
//
//        String communityName = (assignment != null && assignment.getProperty() != null && assignment.getProperty().getCommunity() != null)
//                ? assignment.getProperty().getCommunity().getName() : "No Community";
//
//        // --- DYNAMIC DATA FETCHING ---
//
//        // 1. Fetch Dynamic Invoice Data
//        BigDecimal nextPaymentDue = BigDecimal.ZERO;
//        LocalDate dueDate = null;
//
//        // Find the most recent unpaid invoice for this tenant
//        List<Invoice> tenantInvoices = invoiceRepository.findAllByUserIdAndStatusOrderByDueDateAsc(tenant.getId(), Invoice.InvoiceStatus.UNPAID);
//        if (!tenantInvoices.isEmpty()) {
//            Invoice upcomingInvoice = tenantInvoices.get(0);
//            nextPaymentDue = upcomingInvoice.getAmount();
//            dueDate = upcomingInvoice.getDueDate();
//        }
//
//        // 2. Fetch Dynamic Maintenance Requests
//        List<MaintenanceRequest.RequestStatus> openStatuses = Arrays.asList(
//                MaintenanceRequest.RequestStatus.OPEN,
//                MaintenanceRequest.RequestStatus.ASSIGNED,
//                MaintenanceRequest.RequestStatus.IN_PROGRESS
//        );
//
//        // Count open requests for this tenant
//        long openRequestsCount = maintenanceRepository.countByUserIdAndStatusInAndIsDeletedFalse(tenant.getId(), openStatuses);
//
//        // Get the actual list of recent open requests to display in the UI list
//        List<MaintenanceRequestSummaryDTO> recentRequests = maintenanceRepository.findByUserIdAndStatusInAndIsDeletedFalseOrderByCreatedAtDesc(tenant.getId(), openStatuses)
//                .stream()
//                .limit(3) // Only show the top 3 recent ones on the dashboard
//                .map(req -> MaintenanceRequestSummaryDTO.builder()
//                        .title(req.getTitle())
//                        .status(req.getStatus().name())
//                        .reportedOn(LocalDate.ofInstant(req.getCreatedAt(), java.time.ZoneId.systemDefault()))
//                        .build())
//                .collect(java.util.stream.Collectors.toList());
//
//        // --- BUILD RESPONSE ---
//        return TenantDashboardResponseDTO.builder()
//                .firstName(tenant.getFirstName() != null ? tenant.getFirstName() : "Tenant")
//                .propertyName(unitNumber)
//                .communityName(communityName)
////                .nextPaymentDue(nextPaymentDue)
//                 .nextPaymentDue(BigDecimal.ZERO)//Now Dynamic!
//                .dueDate(dueDate)                     // Now Dynamic!
//                .openRequests((int) openRequestsCount) // Now Dynamic!
//                .recentMaintenanceRequests(recentRequests) // Now Dynamic!
//                .build();
//    }}