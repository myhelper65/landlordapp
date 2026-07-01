-- V1.0.3__fix_audit_columns.sql

-- Communities tablosundaki created_by sütununu düzelt
ALTER TABLE communities DROP COLUMN created_by;
ALTER TABLE communities ADD COLUMN created_by UUID;

-- Properties tablosundaki created_by sütununu düzelt
ALTER TABLE properties DROP COLUMN created_by;
ALTER TABLE properties ADD COLUMN created_by UUID;