-- V1.0.6__create_maintenance_requests_table.sql

CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    user_id UUID NOT NULL, -- Talebi açan kişi
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    resolved_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_maintenance_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_maintenance_user FOREIGN KEY (user_id) REFERENCES users(id)
);