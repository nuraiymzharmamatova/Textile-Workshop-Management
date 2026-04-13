package kg.workshop.erp.controller;

import jakarta.validation.Valid;
import kg.workshop.erp.dto.request.ChangePasswordRequest;
import kg.workshop.erp.entity.User;
import kg.workshop.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole().name()
        ));
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateProfile(Authentication authentication,
                                                              @RequestBody Map<String, String> body) {
        User user = getUser(authentication);
        if (body.containsKey("fullName")) user.setFullName(body.get("fullName"));
        if (body.containsKey("phone")) user.setPhone(body.get("phone"));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "fullName", user.getFullName(),
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "role", user.getRole().name()
        ));
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(Authentication authentication,
                                                               @Valid @RequestBody ChangePasswordRequest request) {
        User user = getUser(authentication);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Неверный текущий пароль"));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Пароль успешно изменён"));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
