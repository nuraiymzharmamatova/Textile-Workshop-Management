package kg.workshop.erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnoreProperties({"productionReports", "hibernateLazyInitializer"})
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties({"productionReports", "hibernateLazyInitializer"})
    private Employee employee;

    @Column(nullable = false)
    private LocalDate reportDate;

    @Column(nullable = false)
    private Integer sewn;

    @Column(nullable = false)
    @Builder.Default
    private Integer packed = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer defective = 0;

    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public int getGoodItems() {
        return sewn - defective;
    }
}
