package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.response.SalaryResponse;
import kg.workshop.erp.entity.Employee;
import kg.workshop.erp.enums.SalaryType;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.EmployeeRepository;
import kg.workshop.erp.repository.ProductionReportRepository;
import kg.workshop.erp.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ProductionReportRepository productionReportRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Employee> getAll() {
        return employeeRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Employee getById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
    }

    @Override
    public Employee create(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Employee update(Long id, Employee updated) {
        Employee employee = getById(id);
        employee.setFullName(updated.getFullName());
        employee.setPhone(updated.getPhone());
        employee.setPosition(updated.getPosition());
        employee.setSalaryType(updated.getSalaryType());
        employee.setRatePerItem(updated.getRatePerItem());
        employee.setFixedSalary(updated.getFixedSalary());
        employee.setActive(updated.getActive());
        return employeeRepository.save(employee);
    }

    @Override
    public void delete(Long id) {
        Employee employee = getById(id);
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalaryResponse> calculateSalaries(LocalDate from, LocalDate to) {
        List<Employee> activeEmployees = employeeRepository.findByActiveTrue();
        String period = from.format(DateTimeFormatter.ofPattern("MM.yyyy"));

        return activeEmployees.stream().map(employee -> {
            BigDecimal salary;

            if (employee.getSalaryType() == SalaryType.FIXED) {
                salary = employee.getFixedSalary() != null ? employee.getFixedSalary() : BigDecimal.ZERO;
            } else {
                int totalSewn = productionReportRepository.sumSewnByEmployeeAndPeriod(
                        employee.getId(), from, to);
                int totalDefective = productionReportRepository.sumDefectiveByEmployeeAndPeriod(
                        employee.getId(), from, to);
                int goodItems = Math.max(0, totalSewn - totalDefective);
                salary = employee.getRatePerItem().multiply(BigDecimal.valueOf(goodItems));
            }

            int totalSewn = productionReportRepository.sumSewnByEmployeeAndPeriod(employee.getId(), from, to);
            int totalDefective = productionReportRepository.sumDefectiveByEmployeeAndPeriod(employee.getId(), from, to);

            return SalaryResponse.builder()
                    .employeeId(employee.getId())
                    .employeeName(employee.getFullName())
                    .salaryType(employee.getSalaryType().name())
                    .totalSewn(totalSewn)
                    .totalDefective(totalDefective)
                    .ratePerItem(employee.getRatePerItem())
                    .fixedSalary(employee.getFixedSalary())
                    .totalSalary(salary)
                    .period(period)
                    .build();
        }).collect(Collectors.toList());
    }
}
