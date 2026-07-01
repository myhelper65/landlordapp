-- Enhance existing announcements table
ALTER TABLE announcements
    ADD COLUMN property_id UUID,
    ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    ADD COLUMN publish_date TIMESTAMP,
    ADD COLUMN expiration_date TIMESTAMP,
    ALTER COLUMN priority TYPE VARCHAR(50); -- Ensure it matches new enum sizes

ALTER TABLE announcements
    ADD CONSTRAINT fk_announcement_property FOREIGN KEY (property_id) REFERENCES properties(id);

-- Create table to track which tenants have read which announcements
CREATE TABLE announcement_read_receipts (
    id UUID PRIMARY KEY,
    announcement_id UUID NOT NULL,
    user_id UUID NOT NULL,
    read_at TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_receipt_announcement FOREIGN KEY (announcement_id) REFERENCES announcements(id),
    CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(announcement_id, user_id) -- A user can only read an announcement once
);