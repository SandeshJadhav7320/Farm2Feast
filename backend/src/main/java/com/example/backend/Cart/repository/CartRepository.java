package com.example.backend.Cart.repository;

import com.example.backend.Cart.entity.Cart;
import com.example.backend.Users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByUser(User user);
}