package com.example.backend.Product.service;

import com.example.backend.Product.dto.ProductRequest;
import com.example.backend.Product.dto.ProductResponse;
import com.example.backend.Product.dto.ProductPageResponse;
import com.example.backend.Product.entity.Product;
import com.example.backend.Product.repository.ProductRepository;
import com.example.backend.exception.ProductNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CloudinaryService cloudinaryService;

    public ProductService(
            ProductRepository productRepository,
            CloudinaryService cloudinaryService) {

        this.productRepository = productRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public ProductResponse createProduct(
            ProductRequest request) {

        String imageUrl =
                cloudinaryService.uploadImage(
                        request.getImage()
                );

        Product product = new Product(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getQuantity(),
                request.getCategory(),
                imageUrl
        );

        Product savedProduct =
                productRepository.save(product);

        return mapToResponse(savedProduct);
    }

    public ProductPageResponse getAllProducts(
            Long cursor,
            int limit) {

        if (limit < 1 || limit > 50) {
            throw new IllegalArgumentException(
                    "Limit must be between 1 and 50"
            );
        }

        Pageable pageable =
                PageRequest.of(0, limit + 1);

        List<Product> products;

        if (cursor == null) {

            products =
                    productRepository
                            .findAllByOrderByIdAsc(pageable);

        } else {

            products =
                    productRepository
                            .findByIdGreaterThanOrderByIdAsc(
                                    cursor,
                                    pageable
                            );
        }

        boolean hasNext =
                products.size() > limit;

        if (hasNext) {
            products =
                    products.subList(0, limit);
        }

        Long nextCursor = null;

        if (!products.isEmpty() && hasNext) {

            nextCursor =
                    products
                            .get(products.size() - 1)
                            .getId();
        }

        List<ProductResponse> responses =
                products.stream()
                        .map(this::mapToResponse)
                        .toList();

        return new ProductPageResponse(
                responses,
                nextCursor,
                hasNext
        );
    }

    public ProductResponse getProductById(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: " + id
                                )
                        );

        return mapToResponse(product);
    }

    public ProductResponse updateProduct(
            Long id,
            ProductRequest request) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: " + id
                                )
                        );

        String oldImageUrl =
                product.getImageUrl();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setCategory(request.getCategory());

        if (request.getImage() != null &&
                !request.getImage().isEmpty()) {

            String newImageUrl =
                    cloudinaryService.uploadImage(
                            request.getImage()
                    );

            product.setImageUrl(newImageUrl);
        }

        Product updatedProduct =
                productRepository.save(product);

        return mapToResponse(updatedProduct);
    }

    public void deleteProduct(Long id) {

        Product product =
                productRepository.findById(id)
                        .orElseThrow(() ->
                                new ProductNotFoundException(
                                        "Product not found with id: " + id
                                )
                        );

        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(
            Product product) {

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getQuantity(),
                product.getCategory(),
                product.getImageUrl(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }

    public long getTotalProductCount() {
        return productRepository.count();
        }
}