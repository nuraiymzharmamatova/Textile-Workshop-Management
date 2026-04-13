package kg.workshop.erp.controller;

import kg.workshop.erp.entity.Employee;
import kg.workshop.erp.entity.EmployeeOperation;
import kg.workshop.erp.entity.SewingOperation;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.EmployeeOperationRepository;
import kg.workshop.erp.repository.EmployeeRepository;
import kg.workshop.erp.repository.SewingOperationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employee-operations")
@RequiredArgsConstructor
public class EmployeeOperationController {

    private final EmployeeOperationRepository empOpRepository;
    private final EmployeeRepository employeeRepository;
    private final SewingOperationRepository operationRepository;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeOperation>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(empOpRepository.findByEmployeeId(employeeId));
    }

    @PostMapping
    public ResponseEntity<EmployeeOperation> assign(@RequestBody Map<String, Long> body) {
        Long employeeId = body.get("employeeId");
        Long operationId = body.get("operationId");

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));
        SewingOperation operation = operationRepository.findById(operationId)
                .orElseThrow(() -> new ResourceNotFoundException("SewingOperation", operationId));

        EmployeeOperation eo = EmployeeOperation.builder()
                .employee(employee)
                .operation(operation)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(empOpRepository.save(eo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id) {
        empOpRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
