package kg.workshop.erp.repository;

import kg.workshop.erp.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    @Query("SELECT m FROM Material m WHERE m.quantity <= m.minQuantity")
    List<Material> findLowStockMaterials();
}
