package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.request.ProductionReportRequest;
import kg.workshop.erp.dto.response.ProductionSummaryResponse;
import kg.workshop.erp.entity.Employee;
import kg.workshop.erp.entity.Order;
import kg.workshop.erp.entity.ProductionReport;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.EmployeeRepository;
import kg.workshop.erp.repository.OrderRepository;
import kg.workshop.erp.repository.ProductionReportRepository;
import kg.workshop.erp.service.MaterialService;
import kg.workshop.erp.service.ProductionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionReportServiceImpl implements ProductionReportService {

    private final ProductionReportRepository reportRepository;
    private final OrderRepository orderRepository;
    private final EmployeeRepository employeeRepository;
    private final MaterialService materialService;

    @Override
    @Transactional(readOnly = true)
    public List<ProductionReport> getAll() {
        return reportRepository.findAll();
    }

    @Override
    public ProductionReport create(ProductionReportRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", request.getOrderId()));

        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", request.getEmployeeId()));
        }

        materialService.deductMaterials(order.getProduct().getId(), request.getSewn());

        ProductionReport report = ProductionReport.builder()
                .order(order)
                .employee(employee)
                .reportDate(request.getReportDate())
                .sewn(request.getSewn())
                .packed(request.getPacked())
                .defective(request.getDefective())
                .notes(request.getNotes())
                .build();

        return reportRepository.save(report);
    }

    @Override
    public void delete(Long id) {
        ProductionReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductionReport", id));
        reportRepository.delete(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductionReport> getByDate(LocalDate date) {
        return reportRepository.findByReportDate(date);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductionReport> getByEmployeeId(Long employeeId) {
        return reportRepository.findByEmployeeId(employeeId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductionReport> getByOrderId(Long orderId) {
        return reportRepository.findByOrderId(orderId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductionSummaryResponse> getDailySummary(LocalDate from, LocalDate to) {
        List<ProductionReport> reports = reportRepository.findByReportDateBetween(from, to);

        Map<LocalDate, List<ProductionReport>> grouped = reports.stream()
                .collect(Collectors.groupingBy(ProductionReport::getReportDate));

        return grouped.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> ProductionSummaryResponse.builder()
                        .date(entry.getKey())
                        .totalSewn(entry.getValue().stream().mapToLong(ProductionReport::getSewn).sum())
                        .totalPacked(entry.getValue().stream().mapToLong(ProductionReport::getPacked).sum())
                        .totalDefective(entry.getValue().stream().mapToLong(ProductionReport::getDefective).sum())
                        .reportCount(entry.getValue().size())
                        .build())
                .collect(Collectors.toList());
    }
}
