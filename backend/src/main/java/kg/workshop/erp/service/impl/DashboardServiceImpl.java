package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.response.DashboardResponse;
import kg.workshop.erp.enums.OrderStatus;
import kg.workshop.erp.repository.MaterialRepository;
import kg.workshop.erp.repository.OrderRepository;
import kg.workshop.erp.repository.ProductionReportRepository;
import kg.workshop.erp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final ProductionReportRepository productionReportRepository;
    private final MaterialRepository materialRepository;

    @Override
    public DashboardResponse getStats() {
        LocalDate now = LocalDate.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd = now.atTime(LocalTime.MAX);

        LocalDate monthStartDate = now.withDayOfMonth(1);

        BigDecimal revenue = orderRepository.calculateRevenue(monthStart, monthEnd);
        long totalOrders = orderRepository.count();
        long activeOrders = orderRepository.countByStatus(OrderStatus.IN_PROGRESS)
                + orderRepository.countByStatus(OrderStatus.SEWING)
                + orderRepository.countByStatus(OrderStatus.CUTTING)
                + orderRepository.countByStatus(OrderStatus.PACKAGING);
        long completedOrders = orderRepository.countByStatus(OrderStatus.COMPLETED);

        int totalSewn = productionReportRepository.sumSewnByPeriod(monthStartDate, now);
        int totalDefective = productionReportRepository.sumDefectiveByPeriod(monthStartDate, now);

        int lowStockCount = materialRepository.findLowStockMaterials().size();

        return DashboardResponse.builder()
                .monthlyRevenue(revenue)
                .totalOrders(totalOrders)
                .activeOrders(activeOrders)
                .completedOrders(completedOrders)
                .totalSewn(totalSewn)
                .totalDefective(totalDefective)
                .lowStockMaterials(lowStockCount)
                .build();
    }
}
