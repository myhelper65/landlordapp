import axiosInstance from './axiosInstance';

const API_URL = '/property-assignments';

export const assignUserToProperty = async (assignmentData) => {
    // assignmentData: { userId, propertyId, type }
    const response = await axiosInstance.post(API_URL, assignmentData);
    return response.data;
};

