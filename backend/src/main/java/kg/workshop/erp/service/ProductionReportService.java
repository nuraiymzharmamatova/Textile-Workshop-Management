package kg.workshop.erp.service;

import kg.workshop.erp.dto.request.ProductionReportRequest;
import kg.workshop.erp.entity.ProductionReport;

import java.time.LocalDate;
import java.util.List;

public interface ProductionReportService {
    List<ProductionReport> getAll();
    ProductionReport create(ProductionReportRequest request);
    List<ProductionReport> getByDate(LocalDate date);
    List<ProductionReport> getByEmployeeId(Long employeeId);
    List<ProductionReport> getByOrderId(Long orderId);
}
