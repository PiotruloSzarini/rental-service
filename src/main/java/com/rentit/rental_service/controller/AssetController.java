package com.rentit.rental_service.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.rentit.rental_service.dto.AssetDTO;
import com.rentit.rental_service.model.Asset;
import com.rentit.rental_service.model.RentalHistory;
import com.rentit.rental_service.model.User;
import com.rentit.rental_service.repository.AssetRepository;
import com.rentit.rental_service.repository.RentalHistoryRepository;
import com.rentit.rental_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class AssetController {

    private final AssetRepository assetRepository;
    private final RentalHistoryRepository historyRepository;
    private final UserRepository userRepository;

    public AssetController(AssetRepository assetRepository,
                           RentalHistoryRepository historyRepository,
                           UserRepository userRepository) {
        this.assetRepository = assetRepository;
        this.historyRepository = historyRepository;
        this.userRepository = userRepository;
    }


    @GetMapping("/assets")
    public org.springframework.data.domain.Page<AssetDTO> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy) {

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(sortBy).ascending());

        return assetRepository.findAll(pageable).map(asset -> new AssetDTO(
                asset.getId(),
                asset.getName(),
                asset.getCategory(),
                asset.getImageUrl(),
                asset.isAvailable(),
                null
        ));
    }

    @PostMapping("/assets")
    public ResponseEntity<?> addAsset(@Valid @RequestBody Asset asset) {
        assetRepository.save(asset);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/assets/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @RequestBody Asset assetDetails) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nie znaleziono id: " + id));

        asset.setName(assetDetails.getName());
        asset.setCategory(assetDetails.getCategory());
        asset.setImageUrl(assetDetails.getImageUrl());

        Asset updatedAsset = assetRepository.save(asset);
        return ResponseEntity.ok(updatedAsset);
    }

    @PatchMapping("/assets/{id}/rent")
    public Asset rentAsset(@PathVariable Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserName = auth.getName();

        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono sprzętu"));

        asset.setAvailable(false);

        RentalHistory history = new RentalHistory(asset, currentUserName, LocalDateTime.now());
        historyRepository.save(history);

        return assetRepository.save(asset);
    }

    @PatchMapping("/assets/{id}/return")
    public Asset returnAsset(@PathVariable Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono sprzętu"));
        asset.setAvailable(true);

        RentalHistory history = historyRepository.findByAssetIdAndReturnDateIsNull(id);
        if (history != null) {
            history.setReturnDate(LocalDateTime.now());
            historyRepository.save(history);
        }
        return assetRepository.save(asset);
    }

    @DeleteMapping("/assets/{id}")
    public void deleteAsset(@PathVariable Long id) {
        List<RentalHistory> records = historyRepository.findAll().stream()
                .filter(h -> h.getAsset() != null && h.getAsset().getId().equals(id))
                .collect(Collectors.toList());

        historyRepository.deleteAll(records);
        assetRepository.deleteById(id);
    }

    @GetMapping("/assets/history")
    public List<RentalHistory> getHistory() {
        return historyRepository.findAllByOrderByRentalDateDesc();
    }

    @GetMapping("/assets/stats")
    public Map<String, Long> getStats() {
        List<Asset> all = assetRepository.findAll();
        long total = all.size();
        long rented = all.stream().filter(a -> !a.isAvailable()).count();
        return Map.of(
                "total", total,
                "rented", rented,
                "available", total - rented
        );
    }

    @GetMapping("/user/me")
    public Map<String, String> getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return Map.of("username", "Gość", "role", "GUEST");
        }

        String roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Map.of(
                "username", auth.getName(),
                "role", roles
        );
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> data) {
        String username = data.get("username");
        String password = data.get("password");

        if (userRepository.findByUsername(username) != null) {
            return ResponseEntity.badRequest().body("Taki użytkownik już istnieje!");
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword("{noop}" + password);
        newUser.setRole("ROLE_USER");

        userRepository.save(newUser);
        return ResponseEntity.ok("Konto założone pomyślnie!");
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public void deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono użytkownika"));

        List<RentalHistory> activeRentals = historyRepository.findAll().stream()
                .filter(h -> h.getRentedBy().equals(user.getUsername()) && h.getReturnDate() == null)
                .toList();

        for (RentalHistory history : activeRentals) {
            if (history.getAsset() != null) {
                Asset asset = history.getAsset();
                asset.setAvailable(true);
                assetRepository.save(asset);
            }
            history.setReturnDate(LocalDateTime.now());
            history.setRentedBy(history.getRentedBy() + " (Konto usunięte)");
            historyRepository.save(history);
        }

        userRepository.delete(user);
    }

    @PatchMapping("/users/{id}/role")
    public User changeRole(@PathVariable Long id, @RequestBody String newRole) {
        User user = userRepository.findById(id).orElseThrow();
        user.setRole(newRole.replace("\"", ""));
        return userRepository.save(user);
    }
}