package kg.workshop.erp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SalaryResponse {
    private Long employeeId;
    private String employeeName;
    private int totalSewn;
    private int totalDefective;
    private BigDecimal ratePerItem;
    private BigDecimal totalSalary;
    private String period;
}
