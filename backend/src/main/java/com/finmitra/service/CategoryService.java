package com.finmitra.service;

import com.finmitra.dto.CategoryRequest;
import com.finmitra.dto.CategoryResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponse createCategory(String userEmail, CategoryRequest request);
    List<CategoryResponse> getUserCategories(String userEmail);
    void deleteCategory(String userEmail, Long categoryId);
}
