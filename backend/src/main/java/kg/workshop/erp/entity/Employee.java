package kg.workshop.erp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import kg.workshop.erp.enums.SalaryType;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 50)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private SalaryType salaryType = SalaryType.PIECEWORK;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal ratePerItem;

    @Column(precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal fixedSalary = BigDecimal.ZERO;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("employee")
    @Builder.Default
    private List<ProductionReport> productionReports = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;
}
