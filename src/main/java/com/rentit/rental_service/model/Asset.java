package com.rentit.rental_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Getter @Setter
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nazwa sprzętu nie może być pusta")
    @Size(min = 3, max = 50, message = "Nazwa musi mieć od 3 do 50 znaków")
    private String name;

    @NotBlank(message = "Kategoria jest wymagana")
    private String category;

    private boolean available = true;

    private String imageUrl;
}