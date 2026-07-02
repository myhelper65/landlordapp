import axiosInstance from './axiosInstance';

const BASE_URL = '/announcements';

const announcementService = {
  // Admin Methods
  getAdminAnnouncements: async (communityId, params) => {
    const response = await axiosInstance.get(`${BASE_URL}/community/${communityId}`, { params });
    return response.data;
  },
  
  getAnnouncementById: async (id) => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}`);
    return response.data;
  },
  
  createAnnouncement: async (data) => {
    const response = await axiosInstance.post(BASE_URL, data);
    return response.data;
  },
  
  updateAnnouncement: async (id, data) => {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data);
    return response.data;
  },
  
  deleteAnnouncement: async (id) => {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
    return response.data;
  },
  
  publishAnnouncement: async (id) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/publish`);
    return response.data;
  },
  
  archiveAnnouncement: async (id) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/archive`);
    return response.data;
  },

  // Tenant Methods
  getTenantAnnouncements: async (params) => {
    const response = await axiosInstance.get(`${BASE_URL}/tenant`, { params });
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`${BASE_URL}/${id}/mark-read`);
    return response.data;
  }
};

export default announcementService;
