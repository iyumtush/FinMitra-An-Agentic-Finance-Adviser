package com.finmitra.config;

import com.finmitra.entity.Budget;
import com.finmitra.entity.Transaction;
import com.finmitra.entity.User;
import com.finmitra.repository.BudgetRepository;
import com.finmitra.repository.TransactionRepository;
import com.finmitra.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public DataInitializer(UserRepository userRepository,
                           TransactionRepository transactionRepository,
                           BudgetRepository budgetRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User demoUser = new User();
            demoUser.setName("Demo User");
            demoUser.setEmail("demo@finmitra.com");
            demoUser.setPassword(passwordEncoder.encode("password123"));

            User savedUser = userRepository.save(demoUser);

            // Seed initial sample transactions
            Transaction salary = new Transaction();
            salary.setUser(savedUser);
            salary.setAmount(new BigDecimal("85000.00"));
            salary.setCategory("Salary");
            salary.setNote("Monthly Base Salary");
            salary.setType("INCOME");
            salary.setDate(LocalDate.now().withDayOfMonth(1));
            transactionRepository.save(salary);

            Transaction rent = new Transaction();
            rent.setUser(savedUser);
            rent.setAmount(new BigDecimal("22000.00"));
            rent.setCategory("Rent");
            rent.setNote("Monthly Apartment Rent");
            rent.setType("EXPENSE");
            rent.setDate(LocalDate.now().withDayOfMonth(3));
            transactionRepository.save(rent);

            Transaction groceries = new Transaction();
            groceries.setUser(savedUser);
            groceries.setAmount(new BigDecimal("8500.00"));
            groceries.setCategory("Food, Beverages and Groceries");
            groceries.setNote("Supermarket & Household Items");
            groceries.setType("EXPENSE");
            groceries.setDate(LocalDate.now().withDayOfMonth(5));
            transactionRepository.save(groceries);

            Transaction shopping = new Transaction();
            shopping.setUser(savedUser);
            shopping.setAmount(new BigDecimal("6200.00"));
            shopping.setCategory("Online Shopping");
            shopping.setNote("Electronics & Apparel");
            shopping.setType("EXPENSE");
            shopping.setDate(LocalDate.now().withDayOfMonth(10));
            transactionRepository.save(shopping);

            // Seed initial sample budgets
            Budget foodBudget = new Budget();
            foodBudget.setUser(savedUser);
            foodBudget.setCategory("Food, Beverages and Groceries");
            foodBudget.setLimitAmount(new BigDecimal("12000.00"));
            budgetRepository.save(foodBudget);

            Budget rentBudget = new Budget();
            rentBudget.setUser(savedUser);
            rentBudget.setCategory("Rent");
            rentBudget.setLimitAmount(new BigDecimal("22000.00"));
            budgetRepository.save(rentBudget);
        }

        // Auto-synchronize PostgreSQL primary key sequences ONLY if running on PostgreSQL
        try {
            java.sql.Connection conn = entityManager.unwrap(java.sql.Connection.class);
            if (conn != null && conn.getMetaData() != null && 
                conn.getMetaData().getDatabaseProductName().toLowerCase().contains("postgres")) {
                
                entityManager.createNativeQuery(
                    "DO $$ " +
                    "BEGIN " +
                    "   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN " +
                    "       PERFORM setval(pg_get_serial_sequence('users', 'id'), COALESCE((SELECT MAX(id) FROM users), 1)); " +
                    "   END IF; " +
                    "   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN " +
                    "       PERFORM setval(pg_get_serial_sequence('transactions', 'id'), COALESCE((SELECT MAX(id) FROM transactions), 1)); " +
                    "   END IF; " +
                    "   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budgets') THEN " +
                    "       PERFORM setval(pg_get_serial_sequence('budgets', 'id'), COALESCE((SELECT MAX(id) FROM budgets), 1)); " +
                    "   END IF; " +
                    "   IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN " +
                    "       PERFORM setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1)); " +
                    "   END IF; " +
                    "END $$;"
                ).executeUpdate();
            }
        } catch (Exception e) {
            // Non-PostgreSQL databases (e.g. MySQL) will bypass cleanly
        }
    }
}
