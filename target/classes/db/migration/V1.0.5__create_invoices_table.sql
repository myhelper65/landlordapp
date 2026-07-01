-- V1.0.5__create_invoices_table.sql

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    property_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    due_date DATE NOT NULL,
    notes TEXT,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_invoice_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_invoice_user FOREIGN KEY (user_id) REFERENCES users(id)
);