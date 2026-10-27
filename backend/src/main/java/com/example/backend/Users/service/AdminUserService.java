package com.example.backend.Users.service;

import com.example.backend.Users.repository.UserRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminUserService {

    private final UserRepo userRepository;

    public AdminUserService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public long getTotalUsers() {
        return userRepository.count();
    }
}