-- V1.0.1__seed_admin.sql
INSERT INTO users (id, email, password_hash, first_name, last_name, role)
VALUES (
    gen_random_uuid(),
    'admin@property.com',
    '$2a$10$cA1vGMlddj2gRni5FLBs..4mxWzDZAZWddulIo67QkamEN7M7mI16',
    'System',
    'Admin',
    'SUPER_ADMIN'
);