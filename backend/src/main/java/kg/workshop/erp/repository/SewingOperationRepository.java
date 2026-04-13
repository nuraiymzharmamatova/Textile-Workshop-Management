package kg.workshop.erp.repository;

import kg.workshop.erp.entity.SewingOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SewingOperationRepository extends JpaRepository<SewingOperation, Long> {
    List<SewingOperation> findByProductId(Long productId);
}
