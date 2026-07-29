package com.finmitra.controller;

import com.finmitra.dto.CategoryRequest;
import com.finmitra.dto.CategoryResponse;
import com.finmitra.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        CategoryResponse response = categoryService.createCategory(userEmail, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getUserCategories(Authentication authentication) {
        String userEmail = authentication.getName();
        List<CategoryResponse> categories = categoryService.getUserCategories(userEmail);
        return ResponseEntity.ok(categories);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable("id") Long id,
            Authentication authentication
    ) {
        String userEmail = authentication.getName();
        categoryService.deleteCategory(userEmail, id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
