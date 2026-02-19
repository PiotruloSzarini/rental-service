package com.rentit.rental_service.repository;

import com.rentit.rental_service.model.RentalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalHistoryRepository extends JpaRepository<RentalHistory, Long> {

    List<RentalHistory> findByRentedBy(String username);

    RentalHistory findByAssetIdAndReturnDateIsNull(Long id);
}