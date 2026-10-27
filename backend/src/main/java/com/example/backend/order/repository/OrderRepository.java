package com.example.backend.order.repository;

import com.example.backend.order.entity.Order;
import com.example.backend.order.enums.OrderStatus;
import com.example.backend.order.enums.PaymentStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;

public interface OrderRepository
        extends JpaRepository<Order, Long> {


    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    long countByStatus(OrderStatus status);

    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.paymentStatus = :paidStatus
          AND o.status <> :cancelledStatus
        """)
    BigDecimal calculateTotalRevenue(
            @Param("paidStatus") PaymentStatus paidStatus,
            @Param("cancelledStatus") OrderStatus cancelledStatus);

            @Query("""
              SELECT
                  FUNCTION('DATE', o.createdAt),
                  COALESCE(SUM(o.totalAmount), 0)
              FROM Order o
              WHERE o.paymentStatus = :paidStatus
                AND o.status <> :cancelledStatus
                AND o.createdAt >= :startDate
                AND o.createdAt < :endDate
              GROUP BY FUNCTION('DATE', o.createdAt)
              ORDER BY FUNCTION('DATE', o.createdAt)
              """)
          List<Object[]> findDailyRevenue(
                  @Param("paidStatus") PaymentStatus paidStatus,
                  @Param("cancelledStatus") OrderStatus cancelledStatus,
                  @Param("startDate") LocalDateTime startDate,
                  @Param("endDate") LocalDateTime endDate
          );
}
