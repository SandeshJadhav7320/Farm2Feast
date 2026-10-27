package com.example.backend.Product.controller;

import com.example.backend.Product.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTotalProductCount() {

        long totalProducts = productService.getTotalProductCount();

        return ResponseEntity.ok(
                Map.of("totalProducts", totalProducts)
        );
    }
}