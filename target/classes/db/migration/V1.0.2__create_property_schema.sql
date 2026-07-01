-- V1.0.2__create_property_schema.sql

-- 1. Communities (Siteler/Topluluklar) Tablosu
CREATE TABLE communities (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20),
    description TEXT,

    -- BaseEntity alanları
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Properties (Mülkler/Daireler) Tablosu
CREATE TABLE properties (
    id UUID PRIMARY KEY,
    community_id UUID NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    property_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notes TEXT,

    -- BaseEntity alanları
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- Foreign Key (Yabancı Anahtar) İlişkisi
    CONSTRAINT fk_property_community
        FOREIGN KEY (community_id)
        REFERENCES communities (id)
);