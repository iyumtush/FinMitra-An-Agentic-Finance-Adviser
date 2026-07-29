package com.finmitra.repository;

import com.finmitra.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByDateDescIdDesc(Long userId);
    List<Transaction> findByUserIdAndType(Long userId, String type);
}
