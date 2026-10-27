package com.example.backend.Product.repository;

import com.example.backend.Product.entity.Product;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderByIdAsc(Pageable pageable);

    List<Product> findByIdGreaterThanOrderByIdAsc(
            Long cursor,
            Pageable pageable
              );
}
