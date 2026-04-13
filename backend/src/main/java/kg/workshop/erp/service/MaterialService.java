package kg.workshop.erp.service;

import kg.workshop.erp.dto.request.MaterialPurchaseRequest;
import kg.workshop.erp.dto.response.StockCheckResponse;
import kg.workshop.erp.entity.Material;
import kg.workshop.erp.entity.MaterialPurchase;

import java.util.List;

public interface MaterialService {
    List<Material> getAll();
    Material getById(Long id);
    Material create(Material material);
    Material update(Long id, Material material);
    void delete(Long id);
    List<Material> getLowStock();
    MaterialPurchase addPurchase(MaterialPurchaseRequest request);
    void deductMaterials(Long productId, int quantity);
    StockCheckResponse checkStock(Long productId, int quantity);
}
