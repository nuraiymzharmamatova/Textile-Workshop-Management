package kg.workshop.erp.repository;

import kg.workshop.erp.entity.ProductionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ProductionReportRepository extends JpaRepository<ProductionReport, Long> {

    List<ProductionReport> findByOrderId(Long orderId);

    List<ProductionReport> findByEmployeeId(Long employeeId);

    List<ProductionReport> findByReportDateBetween(LocalDate from, LocalDate to);

    List<ProductionReport> findByReportDate(LocalDate date);

    @Query("SELECT COALESCE(SUM(pr.sewn), 0) FROM ProductionReport pr WHERE pr.employee.id = :employeeId AND pr.reportDate BETWEEN :from AND :to")
    int sumSewnByEmployeeAndPeriod(@Param("employeeId") Long employeeId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(pr.defective), 0) FROM ProductionReport pr WHERE pr.employee.id = :employeeId AND pr.reportDate BETWEEN :from AND :to")
    int sumDefectiveByEmployeeAndPeriod(@Param("employeeId") Long employeeId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(pr.sewn), 0) FROM ProductionReport pr WHERE pr.reportDate BETWEEN :from AND :to")
    int sumSewnByPeriod(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(pr.defective), 0) FROM ProductionReport pr WHERE pr.reportDate BETWEEN :from AND :to")
    int sumDefectiveByPeriod(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
