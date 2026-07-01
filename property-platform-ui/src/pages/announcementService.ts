// announcementService.ts dosyanı şu şekilde güncelle:

import api from '../api/axiosInstance';

export const announcementAPI = {
  getAdminAnnouncements: (communityId: string, params: any) =>
    api.get(`/announcements/community/${communityId}`, { params }),

  // BURAYA DİKKAT: POST VE SONUNDA SLASH (/) VAR OLMASIN VEYA VARSA KALDIRIN, Spring boot ile eşleşmeli.
  // Spring controller'ınız @PostMapping("/") veya @PostMapping ise ona göre ayarlayın.
  // Sizin Controller'da @PostMapping var, yani base url ile eşleşiyor: "/api/v1/announcements"
  create: (data: any) => api.post('/announcements', data),

  update: (id: string, data: any) => api.put(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
  publish: (id: string) => api.patch(`/announcements/${id}/publish`),
  archive: (id: string) => api.patch(`/announcements/${id}/archive`),
  getTenantAnnouncements: (params: any) => api.get('/announcements/tenant', { params }),
  markAsRead: (id: string) => api.patch(`/announcements/${id}/mark-read`),
};