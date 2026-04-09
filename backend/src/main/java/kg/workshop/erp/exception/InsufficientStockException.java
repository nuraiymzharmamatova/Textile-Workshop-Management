package kg.workshop.erp.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(String materialName) {
        super("Insufficient stock for material: " + materialName);
    }
}
