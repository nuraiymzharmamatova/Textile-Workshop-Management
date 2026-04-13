package kg.workshop.erp.service;

import kg.workshop.erp.dto.request.ProductionReportRequest;
import kg.workshop.erp.dto.response.ProductionSummaryResponse;
import kg.workshop.erp.entity.ProductionReport;

import java.time.LocalDate;
import java.util.List;

public interface ProductionReportService {
    List<ProductionReport> getAll();
    ProductionReport create(ProductionReportRequest request);
    void delete(Long id);
    List<ProductionReport> getByDate(LocalDate date);
    List<ProductionReport> getByEmployeeId(Long employeeId);
    List<ProductionReport> getByOrderId(Long orderId);
    List<ProductionSummaryResponse> getDailySummary(LocalDate from, LocalDate to);
}
