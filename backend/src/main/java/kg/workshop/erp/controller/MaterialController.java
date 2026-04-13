package kg.workshop.erp.controller;

import jakarta.validation.Valid;
import kg.workshop.erp.dto.request.MaterialPurchaseRequest;
import kg.workshop.erp.dto.response.StockCheckResponse;
import kg.workshop.erp.entity.Material;
import kg.workshop.erp.entity.MaterialPurchase;
import kg.workshop.erp.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    public ResponseEntity<List<Material>> getAll() {
        return ResponseEntity.ok(materialService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getById(@PathVariable Long id) {
        return ResponseEntity.ok(materialService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Material> create(@RequestBody Material material) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materialService.create(material));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> update(@PathVariable Long id, @RequestBody Material material) {
        return ResponseEntity.ok(materialService.update(id, material));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Material>> getLowStock() {
        return ResponseEntity.ok(materialService.getLowStock());
    }

    @PostMapping("/purchases")
    public ResponseEntity<MaterialPurchase> addPurchase(@Valid @RequestBody MaterialPurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materialService.addPurchase(request));
    }

    @GetMapping("/check-stock")
    public ResponseEntity<StockCheckResponse> checkStock(@RequestParam Long productId, @RequestParam int quantity) {
        return ResponseEntity.ok(materialService.checkStock(productId, quantity));
    }
}
