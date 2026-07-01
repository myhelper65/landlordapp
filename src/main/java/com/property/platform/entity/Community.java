package com.property.platform.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "communities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Community extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name; // Örn: "Güneş Evleri Sitesi"

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, length = 50)
    private String city;

    @Column(nullable = false, length = 50)
    private String state;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Bir sitenin birden fazla mülkü (dairesi/binası) olur
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Property> properties = new ArrayList<>();
}