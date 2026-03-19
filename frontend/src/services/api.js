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
            useAuthStore.getState().logout(false);
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
    delete: (uid) => api.delete(`/users/${uid}`),
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
    getAnalytics: async () => {
        try {
            return await api.get('/admin/analytics');
        } catch (err) {
            await delay(500);
            return {
                data: {
                    stats: {
                        totalUsers: MOCK_USERS.length,
                        totalProjects: MOCK_PROJECTS.length,
                        pendingProjects: MOCK_PROJECTS.filter(p => p.status === 'pending').length,
                        totalViews: 1250,
                    }
                }
            };
        }
    },
    getUsers: async (params) => {
        try {
            return await api.get('/users', { params });
        } catch (err) {
            await delay(500);
            return { data: { users: MOCK_USERS } };
        }
    },

    // Note: Users can only update themselves unless they are admin, so this uses the standard users PUT route
    updateUser: (uid, data) => api.put(`/users/${uid}`, data),

    // Backend expects POST to /admin/projects/:id/review with an action string
    approveProject: (id) => api.post(`/admin/projects/${id}/review`, { action: 'approve' }),
    rejectProject: (id) => api.post(`/admin/projects/${id}/review`, { action: 'reject' }),
    resetProject: (id) => api.post(`/admin/projects/${id}/review`, { action: 'pending' }),
};

// ── Search ────────────────────────────────────────────────
export const searchAPI = {
    search: (params) => api.get('/search', { params }),
};

// ── Tags ──────────────────────────────────────────────────
export const tagsAPI = {
    getAll: () => api.get('/tags'),
    create: (data) => api.post('/tags', data),
    delete: (id) => api.delete(`/tags/${id}`),
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

// ── Events ────────────────────────────────────────────────
export const eventsAPI = {
    getAll: () => api.get('/events'),
    getById: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
};

export default api;
