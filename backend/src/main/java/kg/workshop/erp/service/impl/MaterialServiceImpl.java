package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.request.MaterialPurchaseRequest;
import kg.workshop.erp.dto.response.StockCheckResponse;
import kg.workshop.erp.entity.Material;
import kg.workshop.erp.entity.MaterialPurchase;
import kg.workshop.erp.entity.TechnicalCardItem;
import kg.workshop.erp.exception.InsufficientStockException;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.MaterialPurchaseRepository;
import kg.workshop.erp.repository.MaterialRepository;
import kg.workshop.erp.repository.TechnicalCardItemRepository;
import kg.workshop.erp.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MaterialServiceImpl implements MaterialService {

    private final MaterialRepository materialRepository;
    private final MaterialPurchaseRepository purchaseRepository;
    private final TechnicalCardItemRepository technicalCardItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Material> getAll() {
        return materialRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Material getById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material", id));
    }

    @Override
    public Material create(Material material) {
        return materialRepository.save(material);
    }

    @Override
    public Material update(Long id, Material updated) {
        Material material = getById(id);
        material.setName(updated.getName());
        material.setUnit(updated.getUnit());
        material.setQuantity(updated.getQuantity());
        material.setMinQuantity(updated.getMinQuantity());
        material.setPricePerUnit(updated.getPricePerUnit());
        material.setSupplier(updated.getSupplier());
        return materialRepository.save(material);
    }

    @Override
    public void delete(Long id) {
        Material material = getById(id);
        materialRepository.delete(material);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Material> getLowStock() {
        return materialRepository.findLowStockMaterials();
    }

    @Override
    public MaterialPurchase addPurchase(MaterialPurchaseRequest request) {
        Material material = getById(request.getMaterialId());
        material.setQuantity(material.getQuantity().add(request.getQuantity()));
        materialRepository.save(material);

        MaterialPurchase purchase = MaterialPurchase.builder()
                .material(material)
                .quantity(request.getQuantity())
                .totalCost(request.getTotalCost())
                .supplier(request.getSupplier())
                .purchaseDate(request.getPurchaseDate())
                .build();
        return purchaseRepository.save(purchase);
    }

    @Override
    public void deductMaterials(Long productId, int quantity) {
        List<TechnicalCardItem> cardItems = technicalCardItemRepository.findByProductId(productId);

        for (TechnicalCardItem item : cardItems) {
            Material material = item.getMaterial();
            BigDecimal required = item.getQuantityPerUnit().multiply(BigDecimal.valueOf(quantity));

            if (material.getQuantity().compareTo(required) < 0) {
                throw new InsufficientStockException(material.getName());
            }

            material.setQuantity(material.getQuantity().subtract(required));
            materialRepository.save(material);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public StockCheckResponse checkStock(Long productId, int quantity) {
        List<TechnicalCardItem> cardItems = technicalCardItemRepository.findByProductId(productId);
        List<StockCheckResponse.StockWarning> warnings = new ArrayList<>();

        for (TechnicalCardItem item : cardItems) {
            Material material = item.getMaterial();
            BigDecimal required = item.getQuantityPerUnit().multiply(BigDecimal.valueOf(quantity));

            if (material.getQuantity().compareTo(required) < 0) {
                warnings.add(StockCheckResponse.StockWarning.builder()
                        .materialName(material.getName())
                        .unit(material.getUnit().name())
                        .required(required)
                        .available(material.getQuantity())
                        .deficit(required.subtract(material.getQuantity()))
                        .build());
            }
        }

        return StockCheckResponse.builder()
                .sufficient(warnings.isEmpty())
                .warnings(warnings)
                .build();
    }
}
