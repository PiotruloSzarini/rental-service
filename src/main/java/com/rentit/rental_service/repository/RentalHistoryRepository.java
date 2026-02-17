package com.rentit.rental_service.repository;

import com.rentit.rental_service.model.RentalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RentalHistoryRepository extends JpaRepository<RentalHistory, Long> {
    // Znajdź historię dla konkretnego przedmiotu, która nie ma jeszcze daty zwrotu
    RentalHistory findByAssetIdAndReturnDateIsNull(Long assetId);

    // Pobierz całą historię posortowaną od najnowszej
    List<RentalHistory> findAllByOrderByRentalDateDesc();
}