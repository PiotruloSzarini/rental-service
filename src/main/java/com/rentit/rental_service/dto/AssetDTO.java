package com.rentit.rental_service.dto;


public record AssetDTO(Long id, String name, String category, String imageUrl, boolean available, String currentRenter) {}
