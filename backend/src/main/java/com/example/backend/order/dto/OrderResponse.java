package com.example.backend.order.dto;

import com.example.backend.order.enums.OrderStatus;
import com.example.backend.order.enums.PaymentMethod;
import com.example.backend.order.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long id;
    private String deliveryName;
    private String phoneNumber;
    private String deliveryAddress;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private String deliveryCompany;
    private String trackingNumber;

    public OrderResponse(
            Long id,
            String deliveryName,
            String phoneNumber,
            String deliveryAddress,
            BigDecimal totalAmount,
            OrderStatus status,
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            LocalDateTime createdAt,
            String deliveryCompany,
            String trackingNumber,
            List<OrderItemResponse> items
           ) {

        this.id = id;
        this.deliveryName = deliveryName;
        this.phoneNumber = phoneNumber;
        this.deliveryAddress = deliveryAddress;
        this.totalAmount = totalAmount;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.createdAt = createdAt;
        this.items = items;
        this.deliveryCompany = deliveryCompany;
        this.trackingNumber = trackingNumber;
    }

    public Long getId() {
        return id;
    }

    public String getDeliveryName() {
        return deliveryName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public String getDeliveryCompany() {
        return deliveryCompany;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }
}