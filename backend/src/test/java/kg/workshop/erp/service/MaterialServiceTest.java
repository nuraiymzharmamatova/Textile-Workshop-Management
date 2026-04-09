package kg.workshop.erp.service;

import kg.workshop.erp.entity.Material;
import kg.workshop.erp.entity.TechnicalCardItem;
import kg.workshop.erp.enums.Unit;
import kg.workshop.erp.exception.InsufficientStockException;
import kg.workshop.erp.repository.MaterialPurchaseRepository;
import kg.workshop.erp.repository.MaterialRepository;
import kg.workshop.erp.repository.TechnicalCardItemRepository;
import kg.workshop.erp.service.impl.MaterialServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaterialServiceTest {

    @Mock
    private MaterialRepository materialRepository;
    @Mock
    private MaterialPurchaseRepository purchaseRepository;
    @Mock
    private TechnicalCardItemRepository technicalCardItemRepository;

    @InjectMocks
    private MaterialServiceImpl materialService;

    @Test
    void deductMaterials_success() {
        Material fabric = Material.builder()
                .id(1L).name("Шерсть").unit(Unit.METER)
                .quantity(BigDecimal.valueOf(100))
                .minQuantity(BigDecimal.valueOf(10))
                .pricePerUnit(BigDecimal.valueOf(500))
                .build();

        TechnicalCardItem cardItem = TechnicalCardItem.builder()
                .material(fabric)
                .quantityPerUnit(BigDecimal.valueOf(2.5)) // 2.5 meters per item
                .build();

        when(technicalCardItemRepository.findByProductId(1L)).thenReturn(List.of(cardItem));
        when(materialRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // Produce 10 items -> need 25 meters
        materialService.deductMaterials(1L, 10);

        assertEquals(BigDecimal.valueOf(75.0), fabric.getQuantity());
    }

    @Test
    void deductMaterials_insufficientStock() {
        Material fabric = Material.builder()
                .id(1L).name("Шёлк").unit(Unit.METER)
                .quantity(BigDecimal.valueOf(5))
                .minQuantity(BigDecimal.valueOf(10))
                .pricePerUnit(BigDecimal.valueOf(1000))
                .build();

        TechnicalCardItem cardItem = TechnicalCardItem.builder()
                .material(fabric)
                .quantityPerUnit(BigDecimal.valueOf(2))
                .build();

        when(technicalCardItemRepository.findByProductId(1L)).thenReturn(List.of(cardItem));

        // Need 20 meters but only have 5
        assertThrows(InsufficientStockException.class,
                () -> materialService.deductMaterials(1L, 10));
    }

    @Test
    void isLowStock_returnsTrue() {
        Material material = Material.builder()
                .quantity(BigDecimal.valueOf(5))
                .minQuantity(BigDecimal.valueOf(10))
                .build();

        assertTrue(material.isLowStock());
    }
}
