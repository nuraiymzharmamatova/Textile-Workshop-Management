package kg.workshop.erp.service;

import kg.workshop.erp.dto.response.SalaryResponse;
import kg.workshop.erp.entity.Employee;
import kg.workshop.erp.enums.SalaryType;
import kg.workshop.erp.repository.EmployeeOperationRepository;
import kg.workshop.erp.repository.EmployeeRepository;
import kg.workshop.erp.repository.ProductionReportRepository;
import kg.workshop.erp.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalaryCalculationTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ProductionReportRepository productionReportRepository;
    @Mock
    private EmployeeOperationRepository employeeOperationRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    @Test
    void calculateSalary_pieceworkWithTotalProduction() {
        Employee employee = Employee.builder()
                .id(1L).fullName("Тестовый Работник")
                .salaryType(SalaryType.PIECEWORK)
                .ratePerItem(BigDecimal.valueOf(100))
                .fixedSalary(BigDecimal.ZERO)
                .active(true).build();

        LocalDate from = LocalDate.of(2023, 10, 1);
        LocalDate to = LocalDate.of(2023, 10, 31);

        when(employeeRepository.findByActiveTrue()).thenReturn(List.of(employee));
        when(productionReportRepository.sumSewnByPeriod(from, to)).thenReturn(150);
        when(productionReportRepository.sumDefectiveByPeriod(from, to)).thenReturn(5);
        when(productionReportRepository.sumSewnByEmployeeAndPeriod(1L, from, to)).thenReturn(0);
        when(productionReportRepository.sumDefectiveByEmployeeAndPeriod(1L, from, to)).thenReturn(0);
        when(employeeOperationRepository.findByEmployeeId(1L)).thenReturn(Collections.emptyList());

        List<SalaryResponse> salaries = employeeService.calculateSalaries(from, to);

        assertEquals(1, salaries.size());
        SalaryResponse salary = salaries.get(0);
        assertEquals(150, salary.getTotalSewn());
        // (150 - 5) * 100 = 14500
        assertEquals(BigDecimal.valueOf(14500), salary.getTotalSalary());
    }

    @Test
    void calculateSalary_fixedModel() {
        Employee employee = Employee.builder()
                .id(2L).fullName("Оклад Работник")
                .salaryType(SalaryType.FIXED)
                .ratePerItem(BigDecimal.ZERO)
                .fixedSalary(BigDecimal.valueOf(50000))
                .active(true).build();

        LocalDate from = LocalDate.of(2023, 10, 1);
        LocalDate to = LocalDate.of(2023, 10, 31);

        when(employeeRepository.findByActiveTrue()).thenReturn(List.of(employee));
        when(productionReportRepository.sumSewnByPeriod(from, to)).thenReturn(0);
        when(productionReportRepository.sumDefectiveByPeriod(from, to)).thenReturn(0);

        List<SalaryResponse> salaries = employeeService.calculateSalaries(from, to);

        assertEquals("FIXED", salaries.get(0).getSalaryType());
        assertEquals(BigDecimal.valueOf(50000), salaries.get(0).getTotalSalary());
    }
}
