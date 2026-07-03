import axiosInstance from './axiosInstance';

export const uploadPropertyDocument = async (propertyId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(`/properties/${propertyId}/documents`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
};

export const getPropertyDocuments = async (propertyId) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/documents`);
    return response.data;
};

export const deletePropertyDocument = async (propertyId, documentId) => {
    const response = await axiosInstance.delete(`/properties/${propertyId}/documents/${documentId}`);
    return response.data;
};

export const getPropertyDetailsWithDocuments = async (propertyId) => {
    const response = await axiosInstance.get(`/properties/${propertyId}/details`);
    return response.data;
};
