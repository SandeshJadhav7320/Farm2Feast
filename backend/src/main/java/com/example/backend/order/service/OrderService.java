package com.example.backend.order.service;

import com.example.backend.order.dto.CreateOrderRequest;
import com.example.backend.order.dto.OrderItemRequest;
import com.example.backend.order.dto.OrderItemResponse;
import com.example.backend.order.dto.OrderResponse;
import com.example.backend.order.entity.Order;
import com.example.backend.order.entity.OrderItem;
import com.example.backend.Product.entity.Product;
import com.example.backend.Users.entity.User;
import com.example.backend.order.enums.OrderStatus;
import com.example.backend.order.enums.PaymentMethod;
import com.example.backend.order.enums.PaymentStatus;
import com.example.backend.order.repository.OrderRepository;
import com.example.backend.Product.repository.ProductRepository;
import com.example.backend.Users.repository.UserRepo;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.order.dto.UpdateOrderStatusRequest;
import com.example.backend.order.dto.OrderCountResponse;
import com.example.backend.order.dto.RevenueSummaryResponse;
import com.example.backend.order.dto.RevenueTrendResponse;
import com.example.backend.order.dto.ShipOrderRequest;
import com.example.backend.order.dto.RevenueTrendResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepo userRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository,
            UserRepo userRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {

        // 1. Identify the authenticated customer.
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException(
                    "Authentication is required to place an order");
        }

        // Assumes the JWT subject is the customer's email.
        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer account not found"));

        // 2. Validate that a product appears only once.
        Set<Long> productIds = new HashSet<>();

        for (OrderItemRequest itemRequest : request.getItems()) {

            if (itemRequest.getProductId() == null) {
                throw new IllegalArgumentException(
                        "Product ID is required");
            }

            if (!productIds.add(itemRequest.getProductId())) {
                throw new IllegalArgumentException(
                        "Each product must appear only once in an order");
            }

            if (itemRequest.getQuantity() <= 0) {
                throw new IllegalArgumentException(
                        "Product quantity must be greater than zero");
            }
        }

        // 3. Create the order and save the delivery details.
        Order order = new Order();

        order.setUser(user);
        order.setDeliveryName(request.getDeliveryName().trim());
        order.setPhoneNumber(request.getPhoneNumber().trim());
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setPaymentMethod(request.getPaymentMethod());

        // 4. Set the initial order and payment statuses.
        if (request.getPaymentMethod() == PaymentMethod.COD) {
            order.setStatus(OrderStatus.PLACED);
            order.setPaymentStatus(PaymentStatus.PENDING);
        } else {
            order.setStatus(OrderStatus.PENDING_PAYMENT);
            order.setPaymentStatus(PaymentStatus.PENDING);
        }

        // 5. Calculate totals using database product prices.
        BigDecimal total = BigDecimal.ZERO;
        List<Product> purchasedProducts = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElseThrow(() ->
                            new IllegalArgumentException(
                                    "Product not found: "
                                            + itemRequest.getProductId()));

            int quantity = itemRequest.getQuantity();

            if (product.getQuantity() < quantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName());
            }

            BigDecimal unitPrice = product.getPrice();

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(quantity));

            OrderItem orderItem = new OrderItem(
                    product,
                    product.getName(),
                    unitPrice,
                    quantity,
                    subtotal);

            order.addItem(orderItem);

            total = total.add(subtotal);
            purchasedProducts.add(product);
        }

        order.setTotalAmount(total);

        // 6. Save the order and its items.
        Order savedOrder = orderRepository.save(order);

        // 7. Reduce the stock for the purchased products.
        for (int i = 0; i < purchasedProducts.size(); i++) {

            Product product = purchasedProducts.get(i);
            int quantity = request.getItems().get(i).getQuantity();

            product.setQuantity(product.getQuantity() - quantity);
        }

        // JPA persists the managed product quantity changes
        // when the transaction commits.
        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {

        User user = getCurrentUser();

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrderById(Long orderId) {

        User user = getCurrentUser();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Order not found"));

        // Customers may only view their own orders.
        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException(
                    "You are not allowed to view this order");
        }

        return mapToResponse(order);
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException(
                    "Authentication is required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Customer account not found"));
    }

    private OrderResponse mapToResponse(Order order) {

        List<OrderItemResponse> itemResponses =
                order.getItems()
                        .stream()
                        .map(item -> new OrderItemResponse(
                                item.getProduct().getId(),
                                item.getProductName(),
                                item.getUnitPrice(),
                                item.getQuantity(),
                                item.getSubtotal(),
                                item.getProduct().getImageUrl()))
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getDeliveryName(),
                order.getPhoneNumber(),
                order.getDeliveryAddress(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getCreatedAt(),
                order.getDeliveryCompany(),
                order.getTrackingNumber(),
                itemResponses);
    }

        @Transactional(readOnly = true)
        public List<OrderResponse> getAllOrdersForAdmin() {

        return orderRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
        }

        @Transactional
        public OrderResponse updateOrderStatus(
                Long orderId,
                UpdateOrderStatusRequest request) {

        if (request.getStatus() == null) {
                throw new IllegalArgumentException(
                        "Order status is required");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderId));

        OrderStatus newStatus = request.getStatus();
        OrderStatus currentStatus = order.getStatus();

        // Prevent reopening a cancelled order through this endpoint.
        if (currentStatus == OrderStatus.CANCELLED
                && newStatus != OrderStatus.CANCELLED) {
                throw new IllegalArgumentException(
                        "A cancelled order cannot be reopened");
        }

        order.setStatus(newStatus);

        Order updatedOrder = orderRepository.save(order);

        return mapToResponse(updatedOrder);
        }

        @Transactional(readOnly = true)
        public OrderCountResponse getTotalOrderCount() {

        long totalOrders = orderRepository.count();

        return new OrderCountResponse(totalOrders);
        }

        @Transactional(readOnly = true)
        public RevenueSummaryResponse getRevenueSummary() {

        BigDecimal totalRevenue =
                orderRepository.calculateTotalRevenue(
                        PaymentStatus.PAID,
                        OrderStatus.CANCELLED);

        long totalOrders = orderRepository.count();

        long deliveredOrders =
                orderRepository.countByStatus(OrderStatus.DELIVERED);

        long paidOrders =
                orderRepository.countByPaymentStatus(PaymentStatus.PAID);

        long pendingPaymentOrders =
                orderRepository.countByPaymentStatus(PaymentStatus.PENDING);

        return new RevenueSummaryResponse(
                totalRevenue,
                totalOrders,
                deliveredOrders,
                paidOrders,
                pendingPaymentOrders);
        }

        @Transactional
        public OrderResponse shipOrder(
                Long orderId,
                ShipOrderRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
                throw new IllegalArgumentException(
                        "A cancelled order cannot be shipped");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
                throw new IllegalArgumentException(
                        "A delivered order cannot be shipped again");
        }

        order.setDeliveryCompany(request.getDeliveryCompany().trim());
        order.setTrackingNumber(request.getTrackingNumber().trim());
        order.setStatus(OrderStatus.SHIPPED);

        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
        }

        public List<RevenueTrendResponse> getRevenueTrend(int days) {
        if (days < 1 || days > 365) {
                throw new IllegalArgumentException(
                        "Days must be between 1 and 365"
                );
        }

        LocalDate today = LocalDate.now();
        LocalDate firstDay = today.minusDays(days - 1L);

        LocalDateTime startDate = firstDay.atStartOfDay();
        LocalDateTime endDate = today.plusDays(1).atStartOfDay();

        List<Object[]> rows = orderRepository.findDailyRevenue(
                PaymentStatus.PAID,
                OrderStatus.CANCELLED,
                startDate,
                endDate
        );

        Map<LocalDate, BigDecimal> revenueByDate = new HashMap<>();

        for (Object[] row : rows) {
                LocalDate date;

                if (row[0] instanceof LocalDate localDate) {
                date = localDate;
                } else if (row[0] instanceof java.sql.Date sqlDate) {
                date = sqlDate.toLocalDate();
                } else {
                date = LocalDate.parse(row[0].toString());
                }

                BigDecimal revenue = (BigDecimal) row[1];
                revenueByDate.put(date, revenue);
        }

        List<RevenueTrendResponse> result = new ArrayList<>();

        for (int i = 0; i < days; i++) {
                LocalDate date = firstDay.plusDays(i);

                result.add(new RevenueTrendResponse(
                        date,
                        revenueByDate.getOrDefault(
                                date, BigDecimal.ZERO
                        )
                ));
        }

        return result;
        }
}