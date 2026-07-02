package com.property.platform.config;

import com.property.platform.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity // Bu, metotların üzerine yetki kontrolü koymamızı sağlar
public class SecurityConfig {

    // Spring Boot bu iki bağımlılığı @RequiredArgsConstructor sayesinde otomatik olarak doldurur (Inject eder)
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults()) // CORS İZNİ BURAYA EKLENDİ
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req ->
//                        req.requestMatchers("/api/v1/auth/**")
                                req.requestMatchers("/api/v1/auth/**", "/error", "/uploads/**") // BURAYA "/uploads/**" EKLENDİ
                                .permitAll()
                                .anyRequest()
                                .authenticated()
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CORS KURALLARINI BELİRLEYEN YENİ BEAN
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // React uygulamasının çalışabileceği portlar
        configuration.setAllowedOrigins(List.of("http://localhost:5177", "http://localhost:5173")); 
        
        // İzin verilen HTTP metotları
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // İzin verilen Header'lar
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        
        // Kimlik doğrulama bilgilerinin taşınmasına izin ver (Token için gerekli)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Bu kuralları tüm uç noktalara (/**) uygula
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}