import axiosInstance from './axiosInstance';

export const getAllUsers = async () => {
    // Backend'deki tüm kullanıcıları getiren endpoint
    const response = await axiosInstance.get('/users');
    return response.data;
};