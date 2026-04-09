package kg.workshop.erp.repository;

import kg.workshop.erp.entity.TechnicalCardItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TechnicalCardItemRepository extends JpaRepository<TechnicalCardItem, Long> {
    List<TechnicalCardItem> findByProductId(Long productId);
}
