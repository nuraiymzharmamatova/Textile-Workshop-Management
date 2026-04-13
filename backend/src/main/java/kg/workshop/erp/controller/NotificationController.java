package kg.workshop.erp.controller;

import kg.workshop.erp.dto.response.NotificationResponse;
import kg.workshop.erp.entity.Material;
import kg.workshop.erp.entity.Order;
import kg.workshop.erp.repository.MaterialRepository;
import kg.workshop.erp.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final MaterialRepository materialRepository;
    private final OrderRepository orderRepository;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll() {
        List<NotificationResponse> notifications = new ArrayList<>();

        // Low stock materials
        List<Material> lowStock = materialRepository.findLowStockMaterials();
        for (Material m : lowStock) {
            notifications.add(NotificationResponse.builder()
                    .type("LOW_STOCK")
                    .title("Мало на складе: " + m.getName())
                    .message("Остаток: " + m.getQuantity() + " " + m.getUnit() + " (мин: " + m.getMinQuantity() + ")")
                    .entityId(m.getId())
                    .build());
        }

        // Approaching deadlines (within 3 days)
        LocalDate today = LocalDate.now();
        List<Order> approaching = orderRepository.findApproachingDeadlines(today, today.plusDays(3));
        for (Order o : approaching) {
            notifications.add(NotificationResponse.builder()
                    .type("DEADLINE_SOON")
                    .title("Дедлайн скоро: заказ #" + o.getId())
                    .message("Клиент: " + o.getClient().getName() + ", срок: " + o.getDeadline())
                    .entityId(o.getId())
                    .build());
        }

        // Overdue orders
        List<Order> overdue = orderRepository.findOverdueOrders(today);
        for (Order o : overdue) {
            notifications.add(NotificationResponse.builder()
                    .type("DEADLINE_OVERDUE")
                    .title("Просрочен: заказ #" + o.getId())
                    .message("Клиент: " + o.getClient().getName() + ", был до: " + o.getDeadline())
                    .entityId(o.getId())
                    .build());
        }

        return ResponseEntity.ok(notifications);
    }
}
