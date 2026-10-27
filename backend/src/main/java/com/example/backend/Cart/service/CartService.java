package com.example.backend.Cart.service;

import com.example.backend.Cart.dto.AddToCartRequest;
import com.example.backend.Cart.entity.Cart;
import com.example.backend.Cart.entity.CartItem;
import com.example.backend.Cart.repository.CartItemRepository;
import com.example.backend.Cart.repository.CartRepository;
import com.example.backend.Product.entity.Product;
import com.example.backend.Product.repository.ProductRepository;
import com.example.backend.Users.entity.User;
import com.example.backend.Users.repository.UserRepo;
import org.springframework.stereotype.Service;
import com.example.backend.Cart.dto.CartItemResponse;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepo userRepository;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepo userRepository) {

        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public void addToCart(
            AddToCartRequest request,
            String userEmail) {

        // 1. Find logged-in user
        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // 2. Find product
        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() ->
                        new RuntimeException("Product not found"));

        // 3. Check quantity
        if (request.getQuantity() == null ||
                request.getQuantity() <= 0) {

            throw new RuntimeException(
                    "Quantity must be greater than 0");
        }

        // 4. Check product stock
        if (request.getQuantity() > product.getQuantity()) {

            throw new RuntimeException(
                    "Not enough product stock");
        }

        // 5. Find user's cart
        Cart cart = cartRepository
                .findByUser(user)
                .orElseGet(() ->
                        cartRepository.save(new Cart(user)));

        // 6. Check whether product is already in cart
        CartItem cartItem = cartItemRepository
                .findByCartAndProduct(cart, product)
                .orElse(null);

        if (cartItem != null) {

            // Product already exists
            int newQuantity =
                    cartItem.getQuantity()
                    + request.getQuantity();

            if (newQuantity > product.getQuantity()) {
                throw new RuntimeException(
                        "Not enough product stock");
            }

            cartItem.setQuantity(newQuantity);

        } else {

            // Product is not in cart
            cartItem = new CartItem(
                    cart,
                    product,
                    request.getQuantity()
            );
        }

        // 7. Save cart item
        cartItemRepository.save(cartItem);
    }


    public List<CartItemResponse> getCart(String userEmail) {

        // 1. Find logged-in user
        User user = userRepository
                .findByEmail(userEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // 2. Find user's cart
        Cart cart = cartRepository
                .findByUser(user)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        // 3. Get all items from the cart
        List<CartItem> cartItems =
                cartItemRepository.findByCart(cart);

        // 4. Convert CartItem entities to response DTOs
        return cartItems.stream()
                .map(cartItem -> {

                    Product product = cartItem.getProduct();

                    BigDecimal totalPrice =
                            product.getPrice()
                                    .multiply(
                                            BigDecimal.valueOf(
                                                    cartItem.getQuantity()
                                            )
                                    );

                    return new CartItemResponse(
                            cartItem.getId(),
                            product.getId(),
                            product.getName(),
                            product.getDescription(),
                            product.getPrice(),
                            product.getImageUrl(),
                            cartItem.getQuantity(),
                            totalPrice
                    );
                })
                .collect(Collectors.toList());
    }

}