package com.insuretrack.config;

import com.insuretrack.user.entity.AuditLog;
import com.insuretrack.user.repository.AuditLogRepository;
import com.insuretrack.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class GlobalAuditInterceptor implements HandlerInterceptor {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    // We only log state-changing actions (POST, PUT, DELETE)
    private static final Set<String> AUDIT_METHODS = Set.of("POST", "PUT", "DELETE");

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        String method = request.getMethod();
        String path = request.getRequestURI();

        // 1. Filter: Only log successful "Command" requests, skip "GET" requests
        if (AUDIT_METHODS.contains(method) && response.getStatus() >= 200 && response.getStatus() < 300) {

            String email = SecurityContextHolder.getContext().getAuthentication().getName();

            // 2. Ensure we don't log anonymous actions (like the initial login itself)
            if (email != null && !email.equals("anonymousUser")) {
                userRepository.findByEmail(email).ifPresent(user -> {

                    // Create a readable action name from the URL
                    String actionDescription = deriveActionName(method, path);

                    AuditLog log = AuditLog.builder()
                            .user(user)
                            .action(actionDescription)
                            .resource(path)
                            .timestamp(LocalDateTime.now())
                            .metadata("Method: " + method + " | Status: " + response.getStatus())
                            .build();

                    auditLogRepository.save(log);
                });
            }
        }
    }

    private String deriveActionName(String method, String path) {
        if (path.contains("/admin/products")) return "PRODUCT_MANAGEMENT";
        if (path.contains("/underwriter/decide")) return "UNDERWRITING_DECISION";
        if (path.contains("/customer/claims")) return "CLAIM_SUBMISSION";
        if (path.contains("/adjuster/claims")) return "CLAIM_ADJUSTMENT";
        return method + "_ACTION";
    }
}