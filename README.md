#   Rent-IT Pro | Modern Asset Management System

A sleek, full-stack asset management and internal rental system designed for modern IT departments. This application features a robust Java Spring Boot backend paired with a high-performance, "Glassmorphism" inspired web interface.

##  Key Features
- **Dynamic Asset Dashboard**: Real-time browsing of company resources with instant filtering and sorting.
- **Smart Rental Logic**: Built-in business rules to prevent double-booking and manage asset availability.
- **Administrative Suite**: Full CRUD (Create, Read, Update, Delete) operations for assets and comprehensive user management (Admin/User roles).
- **Operation History**: Transparent logs of all transactions, tracking who rented what and when.
- **Personalized User Experience**: A dedicated "My Rentals" panel and a "Favorites" system using LocalStorage.

##  Tech Stack
- **Backend**: Java 17+, Spring Boot 3, Spring Security (Role-Based Access Control), Spring Data JPA.
- **Frontend**: Modern JavaScript (ES6+), CSS3 (Flexbox & Grid), HTML5.
- **Database**: H2 (Development) / PostgreSQL (Production) with Hibernate ORM.
- **UI/UX**: SweetAlert2 for interactive notifications, Glassmorphism design principles.

### Prerequisites
- JDK 17 or higher
- Maven 3.8+

##  How to Run Locally : Step-by-Step Guide

### Option 1: Running Locally (Standard)

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/PiotruloSzarini/rent-it-pro.git](https://github.com/PiotruloSzarini/rent-it-pro.git)
   cd rent-it-pro
2. **Build and Run**
   Usin Maven:
   mvn clean spring-boot:run
3. **Access the App**
   open: http://localhost:8080

### Option 2: Running with Docker (Recommended)

**Note:** You must have Docker installed. No Java or Maven installation is required on your host machine.
1. **Clone the Repository** (If you haven't already)
   ```bash
   git clone [https://github.com/PiotruloSzarini/rent-it-pro.git](https://github.com/PiotruloSzarini/rent-it-pro.git)
   cd rent-it-pro
2. **Build the Docker Image**
- docker build -t rent-it-pro .
3. **Run the Docker Container**
- docker run -p 8080:8080 rent-it-pro
4. **Verify**
- Once the console shows "Started RentalServiceApplication", visit:
- http://localhost:8080

## Default Credentials
- Use these accounts to test the system:

Admin: admin / admin123

User: piotr / piotr123
      test / test123
