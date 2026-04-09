package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.request.ProductionReportRequest;
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
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", request.getEmployeeId()));

        // Deduct materials from inventory based on technical card
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
    @Transactional(readOnly = true)
    public List<ProductionReport> getByDate(LocalDate date) {
        return reportRepository.findByReportDateBetween(date, date);
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
}
