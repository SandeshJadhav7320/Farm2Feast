package com.example.backend.Cart.repository;

import com.example.backend.Cart.entity.Cart;
import com.example.backend.Cart.entity.CartItem;
import com.example.backend.Product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);

    List<CartItem> findByCart(Cart cart);
}