package kg.workshop.erp.service.impl;

import kg.workshop.erp.dto.request.OrderRequest;
import kg.workshop.erp.entity.Client;
import kg.workshop.erp.entity.Order;
import kg.workshop.erp.entity.Product;
import kg.workshop.erp.enums.OrderStatus;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.ClientRepository;
import kg.workshop.erp.repository.OrderRepository;
import kg.workshop.erp.repository.ProductRepository;
import kg.workshop.erp.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ClientRepository clientRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAll() {
        return orderRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    @Override
    public Order create(OrderRequest request) {
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        BigDecimal totalPrice = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = Order.builder()
                .client(client)
                .product(product)
                .quantity(request.getQuantity())
                .totalPrice(totalPrice)
                .status(OrderStatus.NEW)
                .deadline(request.getDeadline())
                .notes(request.getNotes())
                .build();

        return orderRepository.save(order);
    }

    @Override
    public Order update(Long id, OrderRequest request) {
        Order order = getById(id);
        Client client = clientRepository.findById(request.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", request.getClientId()));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        order.setClient(client);
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        order.setDeadline(request.getDeadline());
        order.setNotes(request.getNotes());

        return orderRepository.save(order);
    }

    @Override
    public Order updateStatus(Long id, OrderStatus status) {
        Order order = getById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    public void delete(Long id) {
        Order order = getById(id);
        orderRepository.delete(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getByClientId(Long clientId) {
        return orderRepository.findByClientId(clientId);
    }
}
