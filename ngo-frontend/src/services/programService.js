import api from './api'

export const programService = {
  list: (params) => api.get('/programs/', { params }),
  get: (id) => api.get(`/programs/${id}/`),
  create: (data) => api.post('/programs/', data),
  update: (id, data) => api.patch(`/programs/${id}/`, data),
  delete: (id) => api.delete(`/programs/${id}/`),
  mine: () => api.get('/programs/mine/'),
  participants: (id) => api.get(`/programs/${id}/participants/`),
  join: (id) => api.post(`/participation/${id}/join/`),
  leave: (id) => api.post(`/participation/${id}/leave/`),
  myParticipations: () => api.get('/participation/mine/'),
}
