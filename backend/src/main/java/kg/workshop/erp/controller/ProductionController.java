package kg.workshop.erp.controller;

import jakarta.validation.Valid;
import kg.workshop.erp.dto.request.ProductionReportRequest;
import kg.workshop.erp.entity.ProductionReport;
import kg.workshop.erp.service.ProductionReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionReportService reportService;

    @GetMapping
    public ResponseEntity<List<ProductionReport>> getAll() {
        return ResponseEntity.ok(reportService.getAll());
    }

    @PostMapping
    public ResponseEntity<ProductionReport> create(@Valid @RequestBody ProductionReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reportService.create(request));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ProductionReport>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getByDate(date));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ProductionReport>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(reportService.getByEmployeeId(employeeId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ProductionReport>> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(reportService.getByOrderId(orderId));
    }
}
