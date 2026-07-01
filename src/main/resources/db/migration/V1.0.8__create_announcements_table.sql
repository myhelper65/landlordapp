-- V1.0.8__create_announcements_table.sql

CREATE TABLE announcements (
    id UUID PRIMARY KEY,
    community_id UUID NOT NULL, -- Duyuru hangi siteye ait?
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Süresi dolan duyuruları kapatmak için

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_announcement_community FOREIGN KEY (community_id) REFERENCES communities(id)
);