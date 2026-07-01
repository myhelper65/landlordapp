import axiosInstance from './axiosInstance';

export const getAllCommunities = async () => {
    const response = await axiosInstance.get('/communities');
    return response.data;
};

export const createCommunity = async (communityData) => {
    const response = await axiosInstance.post('/communities', communityData);
    return response.data;
};

export const updateCommunity = async (id, communityData) => {
    const response = await axiosInstance.put(`/communities/${id}`, communityData);
    return response.data;
};

export const deleteCommunity = async (id) => {
    await axiosInstance.delete(`/communities/${id}`);
};