package kg.workshop.erp.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ProductionReportRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Report date is required")
    private LocalDate reportDate;

    @NotNull(message = "Sewn count is required")
    @Positive(message = "Sewn count must be positive")
    private Integer sewn;

    @Min(value = 0, message = "Packed count cannot be negative")
    private Integer packed = 0;

    @Min(value = 0, message = "Defective count cannot be negative")
    private Integer defective = 0;

    @Size(max = 500)
    private String notes;
}
