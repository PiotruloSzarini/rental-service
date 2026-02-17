package com.rentit.rental_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
public class RentalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;

    private String rentedBy;
    private LocalDateTime rentalDate;
    private LocalDateTime returnDate;

    public RentalHistory(Asset asset, String rentedBy, LocalDateTime rentalDate) {
        this.asset = asset;
        this.rentedBy = rentedBy;
        this.rentalDate = rentalDate;
    }
}