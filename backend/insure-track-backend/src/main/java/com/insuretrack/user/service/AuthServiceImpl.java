package com.insuretrack.user.service;

import com.insuretrack.user.entity.AuditLog;
import com.insuretrack.user.repository.AuditLogRepository;
import com.insuretrack.user.dto.LoginRequestDTO;
import com.insuretrack.config.JwtService;
import com.insuretrack.customer.entity.Customer;
import com.insuretrack.customer.repository.CustomerRepository;
import com.insuretrack.user.dto.UserRequestDTO;
import com.insuretrack.user.dto.UserResponseDTO;
import com.insuretrack.user.entity.User;
import com.insuretrack.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogRepository auditLogRepository;
    private final CustomerRepository customerRepository;

    @Override
    public UserResponseDTO register(UserRequestDTO request) {

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        userRepository.save(user);
        if(user.getRole().name().equals("CUSTOMER")) {
                Customer customer = Customer.builder()
                    .name(request.getName())
                    .contactInfo(request.getPhone())
                    .user(user)
                    .build();
                customerRepository.save(customer);
        }
        String jwtToken = jwtService.generateToken(user);

        auditLogRepository.save(
                AuditLog.builder()
                        .action("REGISTER")
                        .resource("USER")
                        .timestamp(LocalDateTime.now())
                        .user(user)
                        .metadata("User registered: " + user.getEmail())
                        .build()
        );

        return new UserResponseDTO(user.getUserId(),user.getName(),user.getEmail(),user.getRole(),user.getPhone(),jwtToken);
    }

    @Override
    public UserResponseDTO login(LoginRequestDTO request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        String jwtToken = jwtService.generateToken(user);

        auditLogRepository.save(
                AuditLog.builder()
                        .action("LOGIN")
                        .resource("USER")
                        .timestamp(LocalDateTime.now())
                        .user(user)
                        .metadata("User logged in: " + user.getEmail())
                        .build()
        );

        return new UserResponseDTO(user.getUserId(),user.getName(),user.getEmail(),user.getRole(),user.getPhone(),jwtToken);
    }
    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String resetToken = jwtService.generateToken(user); // You can modify JwtService to set shorter expiration for this

        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        System.out.println("Click here to reset password: " + resetLink);

        auditLogRepository.save(AuditLog.builder()
                .action("FORGOT_PASSWORD_REQUEST")
                .resource("USER")
                .timestamp(LocalDateTime.now())
                .user(user)
                .metadata("Reset link generated for: " + email)
                .build());
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        String email = jwtService.extractUsername(token);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid Token or User not found"));

        if (!jwtService.isTokenValid(token, user)) {
            throw new RuntimeException("Token has expired or is invalid");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .action("PASSWORD_RESET_SUCCESS")
                .resource("USER")
                .timestamp(LocalDateTime.now())
                .user(user)
                .metadata("Password updated via reset link")
                .build());
    }
    @Override
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAll();
    }
    private UserResponseDTO mapToResponse(User user) {
        return UserResponseDTO.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .build();
    }
}
