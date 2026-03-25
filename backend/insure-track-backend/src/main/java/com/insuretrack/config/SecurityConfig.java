package com.insuretrack.config;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ADD THIS LINE
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/risk/**","/docs/**").permitAll()
                        .requestMatchers("/api/admin/products/allproducts").hasAnyRole("ADMIN", "CUSTOMER")
                        .requestMatchers("/api/adjuster/claims/submit","/api/adjuster/claims/customers/**").hasAnyRole("CUSTOMER", "ADJUSTER")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                       // .requestMatchers("/api/agent/quotes/customer/**","/api/agent/policies/customer/{customerId}").hasAnyRole("AGENT","CUSTOMER")
                        .requestMatchers( "/api/customers/endorsements/**").hasAnyRole("AGENT", "CUSTOMER")
                        .requestMatchers("/api/agent/quotes/customers/**","/api/agent/policies/customers/{customerId}").hasAnyRole("AGENT", "CUSTOMER")
                        .requestMatchers("/api/analyst/billing/**").hasAnyRole("ANALYST", "AGENT", "CUSTOMER")
                        .requestMatchers("/api/agent/**","/api/customers/update/insuredobj/**").hasRole("AGENT")
                        .requestMatchers("/api/underwriter/**").hasRole("UNDERWRITER")
                        .requestMatchers("/api/adjuster/**").hasAnyRole("ADJUSTER", "ANALYST","ADMIN")
                        .requestMatchers("/api/analyst/**","/api/{id}/approve").hasAnyRole("ANALYST", "ADMIN","AGENT")
                        .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ADD THIS BEAN TO ALLOW REACT (PORT 3000)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}