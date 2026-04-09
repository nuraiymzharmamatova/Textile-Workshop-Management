package kg.workshop.erp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class DashboardResponse {
    private BigDecimal monthlyRevenue;
    private long totalOrders;
    private long activeOrders;
    private long completedOrders;
    private int totalSewn;
    private int totalDefective;
    private int lowStockMaterials;
}
