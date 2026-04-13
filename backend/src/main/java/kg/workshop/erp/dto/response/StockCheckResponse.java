package kg.workshop.erp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class StockCheckResponse {
    private boolean sufficient;
    private List<StockWarning> warnings;

    @Data
    @Builder
    public static class StockWarning {
        private String materialName;
        private String unit;
        private BigDecimal required;
        private BigDecimal available;
        private BigDecimal deficit;
    }
}
