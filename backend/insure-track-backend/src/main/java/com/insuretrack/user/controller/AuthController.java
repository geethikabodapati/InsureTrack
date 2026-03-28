package com.insuretrack.user.controller;

import com.insuretrack.user.dto.LoginRequestDTO;
import com.insuretrack.user.entity.AuditLog;
import com.insuretrack.user.entity.User;
import com.insuretrack.user.service.AuthService;
import com.insuretrack.user.dto.UserRequestDTO;
import com.insuretrack.user.dto.UserResponseDTO;
import com.insuretrack.user.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@CrossOrigin("http://localhost:3000")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(
            @Valid @RequestBody UserRequestDTO request) {

        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(
            @RequestBody LoginRequestDTO request) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }
    // Add these to your existing AuthController.java

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody LoginRequestDTO request) {
        // We only need the email from LoginRequestDTO
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Reset link sent to your email.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam("token") String token,
            @RequestBody LoginRequestDTO request) {
        // We only need the password from LoginRequestDTO
        authService.resetPassword(token, request.getPassword());
        return ResponseEntity.ok("Password reset successfully.");
    }
    @GetMapping("/auditlogs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(authService.getAllAuditLogs());
    }
    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
}

