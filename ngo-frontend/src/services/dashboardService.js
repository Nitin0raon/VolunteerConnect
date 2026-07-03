import api from './api'

export const dashboardService = {
  ngo: () => api.get('/analytics/ngo-dashboard/'),
  volunteer: () => api.get('/analytics/volunteer-dashboard/'),
}

export const notificationService = {
  list: () => api.get('/activity/mine/'),
}

export const ngoService = {
  createProfile: (data) => api.post('/ngos/profile/', data),
  myProfile: () => api.get('/ngos/profile/me/'),
  list: (params) => api.get('/ngos/', { params }),
  pending: () => api.get('/ngos/pending/'),
  approve: (id) => api.post(`/ngos/${id}/approve/`),
  reject: (id, reason) => api.post(`/ngos/${id}/reject/`, { reason }),
}

export const certificateService = {
  mine: () => api.get('/certificates/mine/'),
  generate: (programId, volunteerId) =>
    api.post(`/certificates/generate/${programId}/${volunteerId}/`),
  download: (id) => api.get(`/certificates/${id}/download/`, { responseType: 'blob' }),
}
