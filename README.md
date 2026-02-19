#   Rent-IT Pro | Modern Asset Management System

**Functional Overview**
- Rent-IT Pro is a comprehensive Asset Management system designed for corporate equipment tracking.
The system features a dynamic interface and secure data handling that adapts based on the logged-in user's role.

# **Features:**

- ***Role-Based Access Control (RBAC)***
- ****User Profile (e.g., piotr, test)****
- *****Tailored for regular employees. Key features:*****

- *****My Operations*****: A private history view restricted strictly to the user's own actions (ensures data privacy).

- *****Live Statuses*****: Occupied asset cards display real-time info: 📦 Rented since: [DATE], so users know exactly when an item became unavailable.

- *****Intuitive Returns*****: A dedicated "Return Now" panel that only appears for items currently assigned to the user.

****Administrator Profile (e.g., admin)****
*****Full control over the asset ecosystem. Key features:*****
- *****Global History*****: Complete oversight of every rental within the company (who, what, and when).

- *****Asset Management*****: Full CRUD module (Create, Read, Update, Delete) for company equipment.

*****User Management Panel*****:
- *****Visual role distinction using icons*****: 🛡️ Admin vs 👤 User.

- *****Ability to dynamically promote/demote users or delete accounts*****.

- *****Hard-Coded Security*****: A system-level lock prevents the deletion or role-change of the main admin account (protection against accidental lockout).
  
***Solution Architecture***
****Backend (Spring Boot & JPA)****
- *****Server-Side Filtering*****: Data filtering happens at the SQL query level (findByRentedBy). This ensures that sensitive data never leaves the server unless the user has the proper authority.

- *****Data Integrity*****: When a user is deleted, the system automatically marks their assigned assets as "Available" and archives the history with the note (Account Deleted).

****Frontend (JavaScript & CSS)****
- *****Dynamic UI*****: The interface rebuilds on-the-fly after login (header changes, admin buttons toggle, icons update).

- *****Glassmorphism Design*****: A modern look using semi-transparent panels (glass-effect), optimized for 2026 UI/UX standards.

## Test accounts 
- Use these accounts to test the system:

Admin: 
- admin / admin123

User: 
- piotr / piotr123
- test / test123

##  Tech Stack
- **Backend**: Java 17+, Spring Boot 3, Spring Security (Role-Based Access Control), Spring Data JPA.
- **Frontend**: Modern JavaScript (ES6+), CSS3 (Flexbox & Grid), HTML5.
- **Database**: H2 (Development) / PostgreSQL (Production) with Hibernate ORM.
- **UI/UX**: SweetAlert2 for interactive notifications, Glassmorphism design principles.

### Prerequisites
- JDK 17 or higher
- Maven 3.8+

##  How to Run Locally : Step-by-Step Guide

### Option 1: Running with Docker (Recommended)

**Note:** You must have Docker installed and open. No Java or Maven installation is required on your host machine.

1. **Clone the Repository** (If you haven't already)
   ```bash
   git clone https://github.com/PiotruloSzarini/rental-service.git
   cd rental-service
2. **Launch the Application**
- docker-compose up --build

3. **Verify**
- Once the console shows "Started RentalServiceApplication", visit:
- http://localhost:8080

4. **Shut Down**
- To stop all services and remove the containers, run:
  docker-compose down



### Option 2: Running Locally (Standard)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/PiotruloSzarini/rental-service.git
   cd rental-service
2. **Start the Database (Required)**
- open docker desktop
- in terminal of your code editor paste:
   docker-compose up -d db

3. **Run the App**
- Use the included Maven Wrapper
-***On Windows***:
./mvnw clean spring-boot:run

- ***On Mac/Linux***:
chmod +x mvnw
./mvnw clean spring-boot:run

4. **Access the App**
- Once the console shows "Started RentalServiceApplication", visit:
- http://localhost:8080

5. **Shut Down**
- To stop all services and remove the containers, run:
  docker-compose down


