package com.example.backend.order.controller;

import com.example.backend.order.dto.OrderCountResponse;
import com.example.backend.order.dto.OrderResponse;
import com.example.backend.order.dto.UpdateOrderStatusRequest;
import com.example.backend.order.service.OrderService;
import com.example.backend.order.dto.RevenueSummaryResponse;
import com.example.backend.order.dto.ShipOrderRequest;
import jakarta.validation.Valid;
import com.example.backend.order.dto.RevenueTrendResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Get all customers' orders
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        List<OrderResponse> orders =
                orderService.getAllOrdersForAdmin();

        return ResponseEntity.ok(orders);
    }

     // Get total order count
    @GetMapping("/count")
    public ResponseEntity<OrderCountResponse> getTotalOrderCount() {

        return ResponseEntity.ok(
                orderService.getTotalOrderCount()
        );
    }

    // Update the status of an order
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        OrderResponse updatedOrder =
                orderService.updateOrderStatus(orderId, request);

        return ResponseEntity.ok(updatedOrder);
    }

    @GetMapping("/revenue-summary")
    public ResponseEntity<RevenueSummaryResponse> getRevenueSummary() {

        RevenueSummaryResponse summary =
                orderService.getRevenueSummary();

        return ResponseEntity.ok(summary);
    }

    @PatchMapping("/{orderId}/ship")
    public ResponseEntity<OrderResponse> shipOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody ShipOrderRequest request) {

        OrderResponse response =
                orderService.shipOrder(orderId, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/revenue-trend")
        public ResponseEntity<List<RevenueTrendResponse>> getRevenueTrend(
                @RequestParam(defaultValue = "7") int days) {

            return ResponseEntity.ok(
                    orderService.getRevenueTrend(days)
            );
        }
}