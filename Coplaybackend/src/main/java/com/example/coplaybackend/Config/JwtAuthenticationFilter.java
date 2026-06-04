package com.example.coplaybackend.Config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String path = request.getServletPath();

        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {
            if (jwtUtils.validateToken(jwt)) {
                String userId = jwtUtils.extractUserId(jwt);  // ← UTILISE L'ID
                String role = jwtUtils.extractRole(jwt);

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String finalRole = (role != null) ? role : "PLAYER";

                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(finalRole);

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId,    // ← UTILISE L'ID AU LIEU DE L'EMAIL
                            null,
                            Collections.singletonList(authority)
                    );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    System.out.println("User (ID): " + userId + " authentifié avec succès. Rôle: " + finalRole);
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur de validation du Token : " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}