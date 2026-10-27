package com.example.backend.Login.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserTestController {

    @GetMapping("/profile")
    public String profile() {
        return "Welcome to User Profile";
    }
}