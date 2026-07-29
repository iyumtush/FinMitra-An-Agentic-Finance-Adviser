# FinMitra — Personal Finance & Wealth Management Platform

**FinMitra** is a modern, full-stack personal finance web application built using **Java Spring Boot**, **Spring Security**, **JWT**, **MySQL**, and **React + Vite**.

---

## 📁 Project Structure

```text
FinMitra/
├── PROJECT_SUMMARY.md        # Master tracking & architecture summary
├── README.md                 # Setup & quickstart guide
├── backend/                  # Java Spring Boot REST API
│   ├── pom.xml               # Maven dependencies (Spring Web, Security, JPA, JWT, Swagger)
│   ├── src/main/java/        # Layered architecture (controller, service, repository, entity, security, dto)
│   └── src/main/resources/   # application.yml (MySQL DB & JWT configuration)
│
└── frontend/                 # React + Vite Web Application
    ├── package.json          # Node dependencies (React, Lucide Icons, Recharts, Axios)
    ├── index.html            # Entry HTML with Google Fonts
    └── src/                  # React components, views, context, and styles
        ├── components/       # Auth cards, Sidebar, TopHeader
        ├── context/          # AuthContext & ThemeContext (Day/Dark mode)
        ├── views/            # DashboardView, TransactionsView, BudgetView, AIInsightView
        └── index.css         # Dark Obsidian & Soft Cream Day mode CSS design system
```

---

## 🚀 Quick Start Guide

### 1. Database Setup (MySQL)
- **Database Name**: `finmitra_db`
- **Host**: `localhost:3306`
- **Username**: `root`
- **Password**: `TushNIIT123#`

---

### 2. Start Backend (Spring Boot Server)
Open terminal in the project directory:
```bash
cd backend
mvn spring-boot:run
```
- **Backend Base URL**: `http://localhost:8085`
- **Interactive Swagger UI**: `http://localhost:8085/swagger-ui/index.html`

---

### 3. Start Frontend (React Web App)
In a new terminal window:
```bash
cd frontend
npm run dev
```
- **Web App URL**: `http://localhost:3000`

---

## ✨ Features Built

1. **Authentication & JWT Security**:
   - Signup (`POST /api/auth/signup`) with BCrypt password hashing & email uniqueness check.
   - Login (`POST /api/auth/login`) generating signed JWT Bearer Tokens.
   - Stateless `JwtAuthenticationFilter` protecting all backend REST APIs.

2. **Day Mode ☀️ / Dark Mode 🌙 Theme Switcher**:
   - 1-click toggle in the top header between sleek **Dark Obsidian Mode** (`#090B0E`) and soft **Warm Cream Day Mode** (`#F5F3EB`).

3. **Dashboard View (`Dashboard`)**:
   - Metrics: Income (`₹35,000`), Expense (`₹23,500`), Savings (`₹11,500`).
   - Category Donut Chart (*Rent*, *Food*, *Transport*, *Shopping*).
   - Income vs Expense Bar Comparison Chart.

4. **Transactions Ledger (`Transactions`)**:
   - All transactions stored in MySQL with Date, Category badges, Note/Description, Type, and Amount (`+₹35,000` / `-₹10,000`).
   - `+ Add transaction` modal & delete action.

5. **Monthly Budgets (`Budget`)**:
   - Category budget progress bars stored in MySQL with remaining amount or over-budget alerts (`Food`, `Rent`, `Transport`, `Shopping`).
   - `+ Set Budget Limit` modal.

6. **AI Financial Insight (`AI Insight`)**:
   - Interactive AI analyzer generating Monthly Summaries, Saving Suggestions, and Investment Growth Ideas.
