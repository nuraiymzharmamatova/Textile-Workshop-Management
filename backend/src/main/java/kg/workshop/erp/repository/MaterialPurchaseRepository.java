package kg.workshop.erp.repository;

import kg.workshop.erp.entity.MaterialPurchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterialPurchaseRepository extends JpaRepository<MaterialPurchase, Long> {
    List<MaterialPurchase> findByMaterialId(Long materialId);
}
