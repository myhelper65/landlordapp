package com.property.platform.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. İsteğin içinde "Authorization" başlığı var mı bak
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        // Eğer başlık yoksa veya "Bearer " ile başlamıyorsa diğer filtrelere geç (Belki login isteğidir)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // 2. Token'ı al ve içindeki emaili çöz
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);
        
        // 3. Kullanıcı emaili varsa ve henüz sisteme giriş yapmamışsa (Context boşsa)
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Veritabanından kullanıcıyı bul
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            
            // Token süresi dolmamış mı, o kullanıcıya mı ait kontrol et
            if (jwtService.isTokenValid(jwt, userDetails)) {
                
                // Güvenlik kapısını aç ve kullanıcıyı sisteme (SecurityContext) yerleştir
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // İsteği ait olduğu asıl Controller'a gönder
        filterChain.doFilter(request, response);
    }
}