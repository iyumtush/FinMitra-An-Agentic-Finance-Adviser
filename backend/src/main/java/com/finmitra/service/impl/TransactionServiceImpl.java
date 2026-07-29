package com.finmitra.service.impl;

import com.finmitra.dto.TransactionRequest;
import com.finmitra.dto.TransactionResponse;
import com.finmitra.entity.Transaction;
import com.finmitra.entity.User;
import com.finmitra.exception.APIException;
import com.finmitra.repository.TransactionRepository;
import com.finmitra.repository.UserRepository;
import com.finmitra.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public TransactionResponse createTransaction(String userEmail, TransactionRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setNote(request.getNote());
        transaction.setType(request.getType().toUpperCase());
        transaction.setDate(request.getDate());

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved);
    }

    @Override
    public List<TransactionResponse> getUserTransactions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        List<Transaction> transactions = transactionRepository.findByUserIdOrderByDateDescIdDesc(user.getId());
        return transactions.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteTransaction(String userEmail, Long transactionId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Transaction not found with id: " + transactionId));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "You do not have permission to delete this transaction");
        }

        transactionRepository.delete(transaction);
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getAmount(),
                t.getCategory(),
                t.getNote(),
                t.getType(),
                t.getDate()
        );
    }
}
