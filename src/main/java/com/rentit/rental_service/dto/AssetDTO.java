package com.rentit.rental_service.dto;

import java.time.LocalDateTime;


public record AssetDTO(
        Long id,
        String name,
        String category,
        String imageUrl,
        boolean available,
        LocalDateTime rentalDate // Zmienione z currentRenter na rentalDate dla jasności
) {}