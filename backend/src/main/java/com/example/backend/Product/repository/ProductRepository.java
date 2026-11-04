
package com.example.backend.Product.repository;

import com.example.backend.Product.entity.Product;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Get only active products
    List<Product> findByActiveTrueOrderByIdAsc(Pageable pageable);

    // Get active products after the cursor
    List<Product> findByActiveTrueAndIdGreaterThanOrderByIdAsc(
            Long cursor,
            Pageable pageable
    );

    // Search only active products with optional filters
    @Query("""
            SELECT p FROM Product p
            WHERE p.active = true
                AND (:cursor IS NULL OR p.id > :cursor)
                AND (
                    :keyword IS NULL
                    OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
                AND (
                    :category IS NULL
                    OR LOWER(p.category) = LOWER(:category)
                )
                AND (:minPrice IS NULL OR p.price >= :minPrice)
                AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            ORDER BY p.id ASC
            """)
    List<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("cursor") Long cursor,
            Pageable pageable
    );

    // Find a product only if it is active
    java.util.Optional<Product> findByIdAndActiveTrue(Long id);
}
