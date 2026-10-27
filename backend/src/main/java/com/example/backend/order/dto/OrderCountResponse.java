package com.example.backend.order.dto;

public class OrderCountResponse {

    private long totalOrders;

    public OrderCountResponse() {
    }

    public OrderCountResponse(long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(long totalOrders) {
        this.totalOrders = totalOrders;
    }
}