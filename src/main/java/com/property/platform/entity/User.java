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

    @Column(length = 20)
    private String phone;

    @Builder.Default
    @Column(name = "first_login_required")
    private boolean firstLoginRequired = false;

    @Builder.Default
    @Column(name = "email_verified")
    private boolean emailVerified = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(length = 20)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

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
    public boolean isEnabled() { return !isDeleted(); }

    public enum UserRole {
        SUPER_ADMIN, PROPERTY_MANAGER, LEASING_AGENT,
        ACCOUNTANT, PROPERTY_OWNER, TENANT,
        MAINTENANCE_TECH, VENDOR
    }

    public enum UserStatus {
        ACTIVE, INVITED, LOCKED, INACTIVE
    }
}