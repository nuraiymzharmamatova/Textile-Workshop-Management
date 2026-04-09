package kg.workshop.erp.service;

import kg.workshop.erp.dto.response.SalaryResponse;
import kg.workshop.erp.entity.Employee;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalaryCalculationTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ProductionReportRepository productionReportRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    @Test
    void calculateSalary_pieceworkModel() {
        Employee employee = Employee.builder()
                .id(1L)
                .fullName("Тестовый Работник")
                .ratePerItem(BigDecimal.valueOf(100))
                .active(true)
                .build();

        LocalDate from = LocalDate.of(2023, 10, 1);
        LocalDate to = LocalDate.of(2023, 10, 31);

        when(employeeRepository.findByActiveTrue()).thenReturn(List.of(employee));
        when(productionReportRepository.sumSewnByEmployeeAndPeriod(1L, from, to)).thenReturn(150);
        when(productionReportRepository.sumDefectiveByPeriod(from, to)).thenReturn(5);

        List<SalaryResponse> salaries = employeeService.calculateSalaries(from, to);

        assertEquals(1, salaries.size());
        SalaryResponse salary = salaries.get(0);
        assertEquals(150, salary.getTotalSewn());
        assertEquals(5, salary.getTotalDefective());
        // (150 - 5) * 100 = 14500
        assertEquals(BigDecimal.valueOf(14500), salary.getTotalSalary());
    }

    @Test
    void calculateSalary_zeroProduction() {
        Employee employee = Employee.builder()
                .id(2L)
                .fullName("Новый Работник")
                .ratePerItem(BigDecimal.valueOf(200))
                .active(true)
                .build();

        LocalDate from = LocalDate.of(2023, 10, 1);
        LocalDate to = LocalDate.of(2023, 10, 31);

        when(employeeRepository.findByActiveTrue()).thenReturn(List.of(employee));
        when(productionReportRepository.sumSewnByEmployeeAndPeriod(2L, from, to)).thenReturn(0);
        when(productionReportRepository.sumDefectiveByPeriod(from, to)).thenReturn(0);

        List<SalaryResponse> salaries = employeeService.calculateSalaries(from, to);

        assertEquals(BigDecimal.ZERO.compareTo(salaries.get(0).getTotalSalary()), 0);
    }
}
