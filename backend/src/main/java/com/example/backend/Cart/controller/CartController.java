
package com.example.backend.Cart.controller;

import com.example.backend.Cart.dto.AddToCartRequest;
import com.example.backend.Cart.dto.CartItemResponse;
import com.example.backend.Cart.service.CartService;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.example.backend.Cart.dto.UpdateCartRequest;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<String> addToCart(
            @RequestBody AddToCartRequest request,
            Authentication authentication) {

        // Get email from JWT
        String userEmail = authentication.getName();

        // Send request to service
        cartService.addToCart(request, userEmail);

        return ResponseEntity.ok("Product added to cart successfully");
    }

    
    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCart(
            Authentication authentication) {

        // Get email from JWT
        String userEmail = authentication.getName();

        // Get cart items
        List<CartItemResponse> cartItems =
                cartService.getCart(userEmail);

        return ResponseEntity.ok(cartItems);
    }

    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<String> updateCartItem(
            @PathVariable Long cartItemId,
            @RequestBody UpdateCartRequest request,
            Authentication authentication
    ) {

        String userEmail = authentication.getName();

        cartService.updateCartItem(
                cartItemId,
                request.getQuantity(),
                userEmail
        );

        return ResponseEntity.ok(
                "Cart quantity updated successfully"
        );
    }

    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<String> removeCartItem(
            @PathVariable Long cartItemId,
            Authentication authentication
    ) {

        String userEmail = authentication.getName();

        cartService.removeCartItem(
                cartItemId,
                userEmail
        );

        return ResponseEntity.ok(
                "Cart item removed successfully"
        );
    }


}

