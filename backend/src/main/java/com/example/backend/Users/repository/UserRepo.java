package com.example.backend.Users.repository;

import com.example.backend.Users.entity.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User, Long> 
{
    Optional<User> findByEmail(String email);
}