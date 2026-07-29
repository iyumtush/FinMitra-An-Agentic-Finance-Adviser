package com.finmitra.service;

import com.finmitra.dto.TransactionRequest;
import com.finmitra.dto.TransactionResponse;
import java.util.List;

public interface TransactionService {
    TransactionResponse createTransaction(String userEmail, TransactionRequest request);
    List<TransactionResponse> getUserTransactions(String userEmail);
    TransactionResponse updateTransaction(String userEmail, Long transactionId, TransactionRequest request);
    void deleteTransaction(String userEmail, Long transactionId);
}
