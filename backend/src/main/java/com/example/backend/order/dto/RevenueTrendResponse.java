package com.example.backend.order.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class RevenueTrendResponse {

    private LocalDate date;
    private BigDecimal revenue;

    public RevenueTrendResponse(LocalDate date, BigDecimal revenue) {
        this.date = date;
        this.revenue = revenue;
    }

    public LocalDate getDate() {
        return date;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }
}