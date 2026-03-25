package com.insuretrack.user.service;

import com.insuretrack.user.dto.LoginRequestDTO;
import com.insuretrack.user.dto.UserRequestDTO;
import com.insuretrack.user.dto.UserResponseDTO;
import com.insuretrack.user.entity.AuditLog;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface AuthService {
    //public UserResponseDTO register(UserRequestDTO request);
    public UserResponseDTO login(LoginRequestDTO request);

    public UserResponseDTO register(UserRequestDTO request);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    List<AuditLog> getAllAuditLogs();
}
