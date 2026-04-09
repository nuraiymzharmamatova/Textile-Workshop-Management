package kg.workshop.erp.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MaterialPurchaseRequest {

    @NotNull(message = "Material ID is required")
    private Long materialId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private BigDecimal quantity;

    @NotNull(message = "Total cost is required")
    @Positive(message = "Total cost must be positive")
    private BigDecimal totalCost;

    private String supplier;

    @NotNull(message = "Purchase date is required")
    private LocalDate purchaseDate;
}
