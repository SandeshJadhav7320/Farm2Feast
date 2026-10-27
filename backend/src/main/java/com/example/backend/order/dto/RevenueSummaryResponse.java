package com.example.backend.order.dto;

import java.math.BigDecimal;

public class RevenueSummaryResponse {

    private BigDecimal totalRevenue;
    private long totalOrders;
    private long deliveredOrders;
    private long paidOrders;
    private long pendingPaymentOrders;

    public RevenueSummaryResponse(
            BigDecimal totalRevenue,
            long totalOrders,
            long deliveredOrders,
            long paidOrders,
            long pendingPaymentOrders) {

        this.totalRevenue = totalRevenue;
        this.totalOrders = totalOrders;
        this.deliveredOrders = deliveredOrders;
        this.paidOrders = paidOrders;
        this.pendingPaymentOrders = pendingPaymentOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public long getTotalOrders() {
        return totalOrders;
    }

    public long getDeliveredOrders() {
        return deliveredOrders;
    }

    public long getPaidOrders() {
        return paidOrders;
    }

    public long getPendingPaymentOrders() {
        return pendingPaymentOrders;
    }
}