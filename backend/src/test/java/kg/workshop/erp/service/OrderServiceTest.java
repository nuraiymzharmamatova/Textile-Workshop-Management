package kg.workshop.erp.service;

import kg.workshop.erp.dto.request.OrderRequest;
import kg.workshop.erp.entity.Client;
import kg.workshop.erp.entity.Order;
import kg.workshop.erp.entity.Product;
import kg.workshop.erp.enums.OrderStatus;
import kg.workshop.erp.exception.ResourceNotFoundException;
import kg.workshop.erp.repository.ClientRepository;
import kg.workshop.erp.repository.OrderRepository;
import kg.workshop.erp.repository.ProductRepository;
import kg.workshop.erp.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Client client;
    private Product product;

    @BeforeEach
    void setUp() {
        client = Client.builder().id(1L).name("Test Client").phone("+996555111222").build();
        product = Product.builder().id(1L).name("Test Product").price(BigDecimal.valueOf(5000)).build();
    }

    @Test
    void createOrder_calculatesTotalPrice() {
        OrderRequest request = new OrderRequest();
        request.setClientId(1L);
        request.setProductId(1L);
        request.setQuantity(10);

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order order = orderService.create(request);

        assertEquals(BigDecimal.valueOf(50000), order.getTotalPrice());
        assertEquals(OrderStatus.NEW, order.getStatus());
        assertEquals(10, order.getQuantity());
    }

    @Test
    void createOrder_throwsWhenClientNotFound() {
        OrderRequest request = new OrderRequest();
        request.setClientId(999L);
        request.setProductId(1L);
        request.setQuantity(1);

        when(clientRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.create(request));
    }

    @Test
    void updateStatus_changesStatus() {
        Order order = Order.builder().id(1L).status(OrderStatus.NEW).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        Order updated = orderService.updateStatus(1L, OrderStatus.IN_PROGRESS);

        assertEquals(OrderStatus.IN_PROGRESS, updated.getStatus());
    }
}
