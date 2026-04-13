package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.response.DashboardResponse;
import kg.workshop.erp.entity.Order;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final ProductionReportRepository productionReportRepository;
    private final MaterialRepository materialRepository;

    @Override
    public DashboardResponse getStats() {
        // Total revenue from ALL completed orders
        List<Order> allOrders = orderRepository.findAll();
        BigDecimal revenue = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Order::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allOrders.size();
        long activeOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.IN_PROGRESS
                        || o.getStatus() == OrderStatus.SEWING
                        || o.getStatus() == OrderStatus.CUTTING
                        || o.getStatus() == OrderStatus.PACKAGING)
                .count();
        long completedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .count();

        // Total production stats - all time
        LocalDate farPast = LocalDate.of(2020, 1, 1);
        LocalDate now = LocalDate.now();
        int totalSewn = productionReportRepository.sumSewnByPeriod(farPast, now);
        int totalDefective = productionReportRepository.sumDefectiveByPeriod(farPast, now);

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
