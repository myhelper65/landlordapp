// src/api/propertyService.js
import axiosInstance from './axiosInstance';

export const getAllProperties = async () => {
    // Backend'deki endpoint'in GET /api/v1/properties olduğunu varsayıyoruz.
    // Eğer endpoint farklıysa, lütfen burayı backend API yapınıza göre güncelleyin.
    const response = await axiosInstance.get('/properties');
    return response.data;
};

export const createProperty = async (propertyData) => {
    const response = await axiosInstance.post('/properties', propertyData);
    return response.data;
};

export const deleteProperty = async (id) => {
    await axiosInstance.delete(`/properties/${id}`);
};
export const updateProperty = async (id, propertyData) => {
    // axiosInstance kullandığımız ve doğru adrese ( /properties/id ) istek attığımızdan emin olalım
    const response = await axiosInstance.put(`/properties/${id}`, propertyData);
    return response.data;
};

