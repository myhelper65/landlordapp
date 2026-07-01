import axiosInstance from './axiosInstance';

const API_URL = '/maintenance-requests';

export const getAllRequests = async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
};

export const createRequest = async (requestData) => {
    const response = await axiosInstance.post(API_URL, requestData);
    return response.data;
};

export const deleteRequest = async (id) => {
    await axiosInstance.delete(`${API_URL}/${id}`);
};


export const updateRequestStatus = async (id, status) => {
    const response = await axiosInstance.put(`/maintenance-requests/${id}/status?status=${status}`);
    return response.data;
};

export const uploadRequestPhotos = async (id, files) => {
    const formData = new FormData();
    // Seçilen tüm dosyaları aynı isimle ('files') formData'ya ekliyoruz
    Array.from(files).forEach(file => {
        formData.append('files', file);
    });

    const response = await axiosInstance.post(`/maintenance-requests/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};












//import axiosInstance from './axiosInstance';
//
//// Backend'deki Controller'ın @RequestMapping yolunun "/maintenance-requests" olduğunu varsayıyoruz
//const API_URL = '/maintenance-requests';
//
//export const getAllMaintenanceRequests = async () => {
//    const response = await axiosInstance.get(API_URL);
//    return response.data;
//};
//
//export const createMaintenanceRequest = async (requestData) => {
//    const response = await axiosInstance.post(API_URL, requestData);
//    return response.data;
//};
//
//export const updateMaintenanceRequest = async (id, requestData) => {
//    const response = await axiosInstance.put(`${API_URL}/${id}`, requestData);
//    return response.data;
//};
//
//export const deleteMaintenanceRequest = async (id) => {
//    await axiosInstance.delete(`${API_URL}/${id}`);
//};