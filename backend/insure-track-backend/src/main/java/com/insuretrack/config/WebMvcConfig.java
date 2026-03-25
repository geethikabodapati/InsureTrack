package com.insuretrack.config;

import com.insuretrack.config.GlobalAuditInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final GlobalAuditInterceptor globalAuditInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // This captures everything under /api/ except for the GET logs themselves
        registry.addInterceptor(globalAuditInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/auditlogs", "/api/underwriter/audit-logs");
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadDir = System.getProperty("user.dir") + "/docs/";
        String path = java.nio.file.Paths.get(uploadDir).toAbsolutePath().toUri().toString();

        registry.addResourceHandler("/docs/**")
                .addResourceLocations(path)
                .setCachePeriod(0); // Add this to prevent browser caching old broken links
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/docs/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET")
                .allowCredentials(true);
    }
}