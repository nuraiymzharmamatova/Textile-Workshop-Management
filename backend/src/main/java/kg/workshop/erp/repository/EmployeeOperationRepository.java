package kg.workshop.erp.repository;

import kg.workshop.erp.entity.EmployeeOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmployeeOperationRepository extends JpaRepository<EmployeeOperation, Long> {
    List<EmployeeOperation> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
