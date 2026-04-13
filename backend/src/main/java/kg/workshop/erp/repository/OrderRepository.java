package kg.workshop.erp.repository;

import kg.workshop.erp.entity.Order;
import kg.workshop.erp.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByClientId(Long clientId);

    @Query("SELECT COALESCE(SUM(o.totalPrice), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt BETWEEN :from AND :to")
    BigDecimal calculateRevenue(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.deadline BETWEEN :from AND :to AND o.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Order> findApproachingDeadlines(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT o FROM Order o WHERE o.deadline < :date AND o.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Order> findOverdueOrders(@Param("date") LocalDate date);
}
