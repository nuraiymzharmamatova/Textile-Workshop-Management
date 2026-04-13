package kg.workshop.erp.controller;

import kg.workshop.erp.entity.Product;
import kg.workshop.erp.entity.SewingOperation;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.ProductRepository;
import kg.workshop.erp.repository.SewingOperationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sewing-operations")
@RequiredArgsConstructor
public class SewingOperationController {

    private final SewingOperationRepository operationRepository;
    private final ProductRepository productRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<SewingOperation>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(operationRepository.findByProductId(productId));
    }

    @GetMapping
    public ResponseEntity<List<SewingOperation>> getAll() {
        return ResponseEntity.ok(operationRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<SewingOperation> create(@RequestBody Map<String, Object> body) {
        Long productId = Long.valueOf(body.get("productId").toString());
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        SewingOperation op = SewingOperation.builder()
                .product(product)
                .name((String) body.get("name"))
                .cost(new java.math.BigDecimal(body.get("cost").toString()))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(operationRepository.save(op));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        operationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
