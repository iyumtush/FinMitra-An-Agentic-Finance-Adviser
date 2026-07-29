# FinMitra — Master Project Tracking & Architecture Summary

This document serves as the master tracking document for **FinMitra**, outlining completed modules, active implementation plans, database schemas, REST APIs, and future roadmap.

---

## 📌 Master Module Status

| Module | Description | Tech Stack | Status |
|---|---|---|---|
| **Module 1** | User Authentication, JWT Security, & MySQL User Entity | Spring Boot, BCrypt, JJWT, MySQL | ✅ **Completed & Verified** |
| **Module 1.5**| Frontend Web Application & Day/Dark Mode UI | React 18, Vite 5, Recharts, Lucide | ✅ **Completed & Verified** |
| **Module 2** | Backend Persistence for Transactions & Budgets (Add, Edit, Delete) | Spring Boot JPA, MySQL, REST APIs | ✅ **Completed & Pushed** |
| **Module 2.5**| Spends Dashboard UI & Custom Categories System | Spring Boot JPA, MySQL, React, Recharts | ✅ **Completed & Pushed** |
| **Module 3** | AI Financial Advice Engine & Spending Analytics | Spring Boot, React, Custom AI Rule Engine | ⏳ **Planned (Next)** |
| **Module 4** | Export & Reporting (CSV / PDF Export) | OpenPDF / Apache POI, React | ⏳ **Planned** |

---

## 🏗️ Architecture & Technology Stack

### Backend Stack
- **Framework**: Spring Boot `3.3.2` (Java `17`/`26`)
- **Database**: MySQL `9.3.0` (`finmitra_db`)
- **ORM & Data Access**: Spring Data JPA / Hibernate ORM
- **Security**: Spring Security + BCrypt Password Encoder + JJWT `0.12.6`
- **Validation**: Jakarta Validation (`@Valid`, `@Email`, `@NotBlank`, `@Size`)
- **API Documentation**: SpringDoc OpenAPI / Swagger UI (`v2.6.0`)
- **Port**: `8085`

### Frontend Stack
- **Framework**: React `18.3` + Vite `5.3`
- **Styling**: Modern CSS Design System (Sleek Dark Obsidian `#090B0E` & Warm Cream Day Mode `#F5F3EB`)
- **Charts**: Recharts (`PieChart`, `BarChart`, `ComposedChart`)
- **Icons**: Lucide React
- **API Client**: Axios with automatic Bearer token interceptor
- **Port**: `3000`

---

## 🗄️ Database Schemas (`finmitra_db`)

### 1. `users` Table (Module 1)
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
```

### 2. `transactions` Table (Module 2)
```sql
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    note VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. `budgets` Table (Module 2)
```sql
CREATE TABLE budgets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    limit_amount DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_category (user_id, category)
);
```

### 4. `categories` Table (Module 2.5)
```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_category_name (user_id, name)
);
```

---

## 📡 REST APIs Catalog

### Module 1: Auth Endpoints (`/api/auth/**`)
- `POST /api/auth/signup` — Registers new user with BCrypt hashed password.
- `POST /api/auth/login` — Authenticates credentials and returns JWT Bearer token.
- `GET /api/test/me` — Protected test endpoint requiring `Authorization: Bearer <token>`.

### Module 2: Transaction & Budget Endpoints (`/api/transactions`, `/api/budgets`)
- `POST /api/transactions` — Add an income credit or expense debit for logged-in user.
- `GET /api/transactions` — Fetch all transactions for logged-in user sorted by date.
- `PUT /api/transactions/{id}` — Edit an existing transaction by ID.
- `DELETE /api/transactions/{id}` — Delete a transaction by ID owned by logged-in user.
- `POST /api/budgets` — Set/update monthly budget limit for a category.
- `GET /api/budgets` — Fetch user's category budget limits vs actual spending.

### Module 2.5: Custom Category Endpoints (`/api/categories`)
- `POST /api/categories` — Create custom category with user-selected color.
- `GET /api/categories` — Fetch user's custom categories.
- `DELETE /api/categories/{id}` — Delete custom category.

---

## 📑 File Structure Map

```text
FinMitra/
├── PROJECT_SUMMARY.md        # Master tracking document (this file)
├── README.md                 # Setup & quickstart guide
├── backend/                  # Java Spring Boot backend project
│   ├── pom.xml
│   └── src/main/java/com/finmitra/
│       ├── config/           # SecurityConfig, CorsConfig
│       ├── controller/       # AuthController, TestController, TransactionController, BudgetController, CategoryController
│       ├── dto/              # Auth, Transaction, Budget, Category DTOs
│       ├── entity/           # User, Transaction, Budget, Category entities
│       ├── exception/        # GlobalExceptionHandler, APIException
│       ├── repository/       # UserRepository, TransactionRepository, BudgetRepository, CategoryRepository
│       ├── security/         # JwtTokenProvider, JwtAuthenticationFilter, CustomUserDetailsService
│       └── service/          # AuthService, TransactionService, BudgetService, CategoryService
└── frontend/                 # React Vite frontend project
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── api/              # authApi, transactionApi, budgetApi, categoryApi
        ├── components/       # Auth, Sidebar, TopHeader, Cards, OnboardingModal, CategorySpendsBar
        ├── context/          # AuthContext, ThemeContext
        ├── views/            # DashboardView, TransactionsView, BudgetView, AIInsightView
        └── index.css         # Dark & Day theme design system
```
