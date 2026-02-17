package com.rentit.rental_service.repository;

import com.rentit.rental_service.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset, Long> {
}
