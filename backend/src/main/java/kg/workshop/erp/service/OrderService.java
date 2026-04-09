package kg.workshop.erp.service;

import kg.workshop.erp.dto.request.OrderRequest;
import kg.workshop.erp.entity.Order;
import kg.workshop.erp.enums.OrderStatus;

import java.util.List;

public interface OrderService {
    List<Order> getAll();
    Order getById(Long id);
    Order create(OrderRequest request);
    Order update(Long id, OrderRequest request);
    Order updateStatus(Long id, OrderStatus status);
    void delete(Long id);
    List<Order> getByStatus(OrderStatus status);
    List<Order> getByClientId(Long clientId);
}
