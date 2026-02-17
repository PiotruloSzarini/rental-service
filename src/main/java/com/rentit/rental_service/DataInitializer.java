package com.rentit.rental_service;

import com.rentit.rental_service.model.Asset;
import com.rentit.rental_service.model.RentalHistory;
import com.rentit.rental_service.model.User;
import com.rentit.rental_service.repository.AssetRepository;
import com.rentit.rental_service.repository.RentalHistoryRepository;
import com.rentit.rental_service.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final RentalHistoryRepository rentalHistoryRepository;

    public DataInitializer(UserRepository userRepository,
                           AssetRepository assetRepository,
                           RentalHistoryRepository rentalHistoryRepository) {
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.rentalHistoryRepository = rentalHistoryRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin") == null) {

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("{noop}admin123");
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);


            User piotr = new User();
            piotr.setUsername("piotr");
            piotr.setPassword("{noop}piotr123");
            piotr.setRole("ROLE_USER");
            userRepository.save(piotr);

            User testUser = new User();
            testUser.setUsername("test");
            testUser.setPassword("{noop}test123");
            testUser.setRole("ROLE_USER");
            userRepository.save(testUser);


            Asset macbook = new Asset();
            macbook.setName("MacBook Pro 14");
            macbook.setCategory("laptop");
            macbook.setImageUrl("https://files.refurbed.com/ii/apple-macbook-pro-2021-m1-14-1658749095.jpg?t=fitdesign&h=600&w=800&t=convert&f=webp");
            macbook.setAvailable(false);
            assetRepository.save(macbook);

            Asset sluchawki = new Asset();
            sluchawki.setName("Słuchawki biurowe");
            sluchawki.setCategory("słuchawki");
            sluchawki.setImageUrl("https://cdn.x-kom.pl/i/setup/images/prod/big/product-new-big,,pr_2016_9_1_10_51_33_668.jpg");
            sluchawki.setAvailable(true);
            assetRepository.save(sluchawki);


            RentalHistory rental = new RentalHistory();
            rental.setAsset(macbook);
            rental.setRentedBy("piotr");
            rental.setRentalDate(LocalDateTime.now());
            rental.setReturnDate(null);
            rentalHistoryRepository.save(rental);

            System.out.println("✅ Aplikacja zainicjalizowana: Admin, Piotr, Test i sprzęty gotowe!");
        }
    }
}