import axiosInstance from './axiosInstance';

const API_URL = '/property-assignments';

export const assignUserToProperty = async (assignmentData) => {
    // assignmentData: { userId, propertyId, type }
    const response = await axiosInstance.post(API_URL, assignmentData);
    return response.data;
};

export const removeUserFromProperty = async (assignmentId) => {
    const response = await axiosInstance.delete(`/user-properties/${assignmentId}`);
    return response.data;
};

export const inviteTenant = async (inviteData) => {
    const response = await axiosInstance.post(`/tenant/invite`, inviteData);
    return response.data;
};
