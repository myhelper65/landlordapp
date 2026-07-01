-- V1.0.4__create_user_property_table.sql

CREATE TABLE user_properties (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    property_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_up_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_up_property FOREIGN KEY (property_id) REFERENCES properties(id)
);