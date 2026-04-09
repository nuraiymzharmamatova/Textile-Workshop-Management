package kg.workshop.erp.service;

import kg.workshop.erp.dto.response.SalaryResponse;
import kg.workshop.erp.entity.Employee;

import java.time.LocalDate;
import java.util.List;

public interface EmployeeService {
    List<Employee> getAll();
    Employee getById(Long id);
    Employee create(Employee employee);
    Employee update(Long id, Employee employee);
    void delete(Long id);
    List<SalaryResponse> calculateSalaries(LocalDate from, LocalDate to);
}
