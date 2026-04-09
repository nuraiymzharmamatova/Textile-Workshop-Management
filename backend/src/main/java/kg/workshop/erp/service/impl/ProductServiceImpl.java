package kg.workshop.erp.service.impl;

import kg.workshop.erp.entity.Product;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.ProductRepository;
import kg.workshop.erp.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    @Override
    public Product create(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product update(Long id, Product updated) {
        Product product = getById(id);
        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setPrice(updated.getPrice());
        product.setLaborCost(updated.getLaborCost());
        product.setImageUrl(updated.getImageUrl());
        return productRepository.save(product);
    }

    @Override
    public void delete(Long id) {
        Product product = getById(id);
        productRepository.delete(product);
    }
}
