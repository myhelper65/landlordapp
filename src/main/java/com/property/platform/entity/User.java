package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "enabled", columnDefinition = "boolean default true")
    private boolean enabled = true;

    @Column(name = "email_verified", columnDefinition = "boolean default false")
    private boolean emailVerified = false;

    @Column(name = "first_login_required", columnDefinition = "boolean default false")
    private boolean firstLoginRequired = false;

    @Column(name = "account_locked", columnDefinition = "boolean default false")
    private boolean accountLocked = false;

    @Column(name = "failed_login_attempts", columnDefinition = "integer default 0")
    private int failedLoginAttempts = 0;

    @Column(name = "last_login")
    private java.time.Instant lastLogin;

    // İŞTE BİZİ KURTARACAK OLAN SİHİRLİ SATIR BURADA
    @Enumerated(EnumType.STRING)
    // SİHİRLİ SATIRI POSTGRESQL'E ÖZEL TİPLE DEĞİŞTİRİYORUZ
    @org.hibernate.annotations.JdbcType(org.hibernate.dialect.PostgreSQLEnumJdbcType.class)
    @Column(name = "role", columnDefinition = "user_role", nullable = false)
    private UserRole role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return enabled && !isDeleted(); }

    public enum UserRole {
        SUPER_ADMIN, PROPERTY_MANAGER, LEASING_AGENT,
        ACCOUNTANT, PROPERTY_OWNER, TENANT,
        MAINTENANCE_TECH, VENDOR
    }
}