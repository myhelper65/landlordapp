// src/api/dashboardService.js
import axiosInstance from './axiosInstance';

export const getDashboardSummary = async () => {
    // AxiosInstance kullandığımız için token otomatik eklenecek
    const response = await axiosInstance.get('/dashboard/summary');
    return response.data;
};