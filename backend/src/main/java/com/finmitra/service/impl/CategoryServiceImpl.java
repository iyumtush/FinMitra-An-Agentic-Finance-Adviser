package com.finmitra.service.impl;

import com.finmitra.dto.CategoryRequest;
import com.finmitra.dto.CategoryResponse;
import com.finmitra.entity.Category;
import com.finmitra.entity.User;
import com.finmitra.exception.APIException;
import com.finmitra.repository.CategoryRepository;
import com.finmitra.repository.UserRepository;
import com.finmitra.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CategoryResponse createCategory(String userEmail, CategoryRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        Optional<Category> existing = categoryRepository.findByUserIdAndNameIgnoreCase(user.getId(), request.getName().trim());
        if (existing.isPresent()) {
            throw new APIException(HttpStatus.BAD_REQUEST, "Category already exists: " + request.getName());
        }

        Category category = new Category();
        category.setUser(user);
        category.setName(request.getName().trim());
        category.setColor(request.getColor().trim());

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Override
    public List<CategoryResponse> getUserCategories(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        List<Category> categories = categoryRepository.findByUserId(user.getId());
        return categories.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(String userEmail, Long categoryId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "User not found"));

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new APIException(HttpStatus.NOT_FOUND, "Category not found"));

        if (!category.getUser().getId().equals(user.getId())) {
            throw new APIException(HttpStatus.FORBIDDEN, "Permission denied to delete category");
        }

        categoryRepository.delete(category);
    }

    private CategoryResponse mapToResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getColor());
    }
}
