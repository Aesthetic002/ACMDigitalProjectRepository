import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach Firebase JWT
api.interceptors.request.use(
    async (config) => {
        const token = useAuthStore.getState().token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

// ── Projects ──────────────────────────────────────────────
export const projectsAPI = {
    getAll: (params) => api.get('/projects', { params }),
    getById: (id) => api.get(`/projects/${id}`),
    create: (data) => api.post('/projects', data),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
};

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
    syncUser: (data) => api.post('/auth/sync', data),
};

// ── Users ─────────────────────────────────────────────────
export const usersAPI = {
    getById: (uid) => api.get(`/users/${uid}`),
    update: (uid, data) => api.put(`/users/${uid}`, data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
    getAnalytics: () => api.get('/admin/analytics'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (uid, data) => api.put(`/admin/users/${uid}`, data),
    approveProject: (id) => api.put(`/admin/projects/${id}/approve`),
    rejectProject: (id) => api.put(`/admin/projects/${id}/reject`),
};

// ── Search ────────────────────────────────────────────────
export const searchAPI = {
    search: (params) => api.get('/search', { params }),
};

// ── Tags ──────────────────────────────────────────────────
export const tagsAPI = {
    getAll: () => api.get('/tags'),
    create: (data) => api.post('/tags', data),
};

// ── Assets ────────────────────────────────────────────────
export const assetsAPI = {
    upload: (projectId, formData) =>
        api.post(`/projects/${projectId}/assets`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (projectId, assetId) =>
        api.delete(`/projects/${projectId}/assets/${assetId}`),
};

export default api;
