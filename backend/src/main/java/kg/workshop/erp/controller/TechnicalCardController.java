package kg.workshop.erp.controller;

import kg.workshop.erp.entity.Material;
import kg.workshop.erp.entity.Product;
import kg.workshop.erp.entity.TechnicalCardItem;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.MaterialRepository;
import kg.workshop.erp.repository.ProductRepository;
import kg.workshop.erp.repository.TechnicalCardItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/technical-card")
@RequiredArgsConstructor
public class TechnicalCardController {

    private final TechnicalCardItemRepository cardRepository;
    private final ProductRepository productRepository;
    private final MaterialRepository materialRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<TechnicalCardItem>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(cardRepository.findByProductId(productId));
    }

    @PostMapping
    public ResponseEntity<TechnicalCardItem> create(@RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        Long materialId = Long.valueOf(body.get("materialId").toString());
        BigDecimal quantityPerUnit = new BigDecimal(body.get("quantityPerUnit").toString());

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new ResourceNotFoundException("Material", materialId));

        TechnicalCardItem item = TechnicalCardItem.builder()
                .product(product)
                .material(material)
                .quantityPerUnit(quantityPerUnit)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(cardRepository.save(item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cardRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
