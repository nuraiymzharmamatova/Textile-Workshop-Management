package kg.workshop.erp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ClientRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+]+$", message = "Invalid phone number format")
    private String phone;

    @Size(max = 255)
    private String address;

    @Size(max = 500)
    private String notes;
}
