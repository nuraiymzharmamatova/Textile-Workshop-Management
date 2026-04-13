package kg.workshop.erp.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionSummaryResponse {
    private LocalDate date;
    private long totalSewn;
    private long totalPacked;
    private long totalDefective;
    private long reportCount;
}
