-- V1.0.7__create_documents_table.sql

CREATE TABLE documents (
    id UUID PRIMARY KEY,
    property_id UUID,          -- Belge bir mülke ait olabilir (Kira sözleşmesi vb.)
    user_id UUID,              -- Belge bir kullanıcıya ait olabilir (Kimlik fotokopisi vb.)
    request_id UUID,           -- Belge bir arıza kaydına ait olabilir (Hasar fotoğrafı vb.)

    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,    -- application/pdf, image/jpeg vb.
    file_url TEXT NOT NULL,            -- Dosyanın S3'teki veya sunucudaki tam adresi/yolu
    file_size BIGINT NOT NULL,         -- Byte cinsinden dosya boyutu

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    created_by UUID,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_doc_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_doc_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_doc_request FOREIGN KEY (request_id) REFERENCES maintenance_requests(id)
);