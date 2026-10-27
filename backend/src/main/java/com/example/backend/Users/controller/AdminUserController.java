package com.example.backend.Users.controller;

import com.example.backend.Users.service.AdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTotalUsers() {

        long totalUsers = adminUserService.getTotalUsers();

        return ResponseEntity.ok(
                Map.of("totalUsers", totalUsers)
        );
    }
}