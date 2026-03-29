import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// ============ Auth API ============
export const authAPI = {
  verify: () => api.post('/auth/verify'),
  register: (data) => api.post('/auth/verify', data),
}

// ============ Users API ============
export const usersAPI = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (userId) => api.get(`/users/${userId}`),
  update: (userId, data) => api.put(`/users/${userId}`, data),
}

// ============ Projects API ============
export const projectsAPI = {
  // READ
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (projectId) => api.get(`/projects/${projectId}`),

  // WRITE
  create: (data) => api.post('/projects', data),
  update: (projectId, data) => api.put(`/projects/${projectId}`, data),
  delete: (projectId) => api.delete(`/projects/${projectId}`),
}

// ============ Search API ============
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
}

// ============ Tags API ============
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  update: (tagId, data) => api.put(`/tags/${tagId}`, data),
  delete: (tagId) => api.delete(`/tags/${tagId}`),
}

// ============ Admin API ============
// ============ Admin API ============
export const adminAPI = {
  getStats: () => api.get('/admin/analytics'),
  getPendingProjects: () => api.get('/projects', { params: { status: 'pending' } }),
  getAnalytics: () => api.get('/admin/analytics'),

  // Review actions
  approveProject: (projectId) => api.post(`/admin/projects/${projectId}/review`, { action: 'approve' }),
  rejectProject: (projectId, reason) => api.post(`/admin/projects/${projectId}/review`, { action: 'reject', notes: reason }),
  reviewProject: (projectId, data) => api.post(`/admin/projects/${projectId}/review`, data),

  // Feature action - wrap boolean in object
  featureProject: (projectId, featured) => api.post(`/admin/projects/${projectId}/feature`, { featured }),
}

// ============ Assets API ============
export const assetsAPI = {
  getUploadUrl: (data) => api.post('/assets/upload-url', data),
  listProjectAssets: (projectId) => api.get(`/projects/${projectId}/assets`),
  delete: (assetId) => api.delete(`/assets/${assetId}`),
}

export default api
