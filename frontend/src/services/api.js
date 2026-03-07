import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USERS, MOCK_PROJECTS, MOCK_TAGS } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: { 'Content-Type': 'application/json' },
});

// Helper to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    getAll: async (params) => {
        try {
            const res = await api.get('/projects', { params });
            return res;
        } catch (err) {
            console.warn("Using MOCK_PROJECTS due to API error");
            await delay(500);
            return { data: { projects: MOCK_PROJECTS } };
        }
    },
    getById: async (id) => {
        try {
            return await api.get(`/projects/${id}`);
        } catch (err) {
            const project = MOCK_PROJECTS.find(p => p.id === id);
            return { data: { project } };
        }
    },
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
    getById: async (uid) => {
        try {
            return await api.get(`/users/${uid}`);
        } catch (err) {
            const user = MOCK_USERS.find(u => u.uid === uid);
            return { data: { user } };
        }
    },
    update: (uid, data) => api.put(`/users/${uid}`, data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
    getAnalytics: async () => {
        try {
            return await api.get('/admin/analytics');
        } catch (err) {
            return { data: { stats: { users: 154, projects: 42, domains: 12, events: 5 } } };
        }
    },
    getUsers: async (params) => {
        try {
            const res = await api.get('/admin/users', { params });
            return res;
        } catch (err) {
            console.warn("Using MOCK_USERS due to API error");
            await delay(500);
            return { data: { users: MOCK_USERS } };
        }
    },
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
    getAll: async () => {
        try {
            return await api.get('/tags');
        } catch (err) {
            return { data: { tags: MOCK_TAGS } };
        }
    },
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
