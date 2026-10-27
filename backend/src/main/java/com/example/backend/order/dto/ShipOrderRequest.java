package com.example.backend.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ShipOrderRequest {

    @NotBlank(message = "Delivery company is required")
    @Size(max = 100)
    private String deliveryCompany;

    @NotBlank(message = "Tracking number is required")
    @Size(max = 100)
    private String trackingNumber;

    public ShipOrderRequest() {
    }

    public String getDeliveryCompany() {
        return deliveryCompany;
    }

    public void setDeliveryCompany(String deliveryCompany) {
        this.deliveryCompany = deliveryCompany;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }
}