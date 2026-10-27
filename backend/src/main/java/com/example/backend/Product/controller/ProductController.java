package com.example.backend.Product.controller;

import com.example.backend.Product.dto.ProductRequest;
import com.example.backend.Product.dto.ProductResponse;
import com.example.backend.Product.dto.ProductPageResponse;
import com.example.backend.Product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService) {

        this.productService = productService;
    }

    @PostMapping(
            value = "/admin/products",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @ModelAttribute ProductRequest request) {

        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity.ok(response);
    }

    @PutMapping(
            value = "/admin/products/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @ModelAttribute ProductRequest request) {

        ProductResponse response =
                productService.updateProduct(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/admin/products/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/products")
    public ResponseEntity<ProductPageResponse> getAllProducts(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "15") int limit) {

        ProductPageResponse response =
                productService.getAllProducts(
                        cursor,
                        limit
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/products/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id) {

        ProductResponse response =
                productService.getProductById(id);

        return ResponseEntity.ok(response);
    }
}