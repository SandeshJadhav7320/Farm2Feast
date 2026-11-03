
package com.example.backend.Product.controller;

import com.example.backend.Product.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    // Get total product count
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTotalProductCount() {

        long totalProducts = productService.getTotalProductCount();

        return ResponseEntity.ok(
            Map.of("totalProducts", totalProducts)
        );
    }

    // Delete product by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.ok(
            Map.of("message", "Product deleted successfully")
        );
    }
}
