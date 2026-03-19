import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { fsUsers, fsProjects, fsDomains } from './firebaseService';

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
            // Priority 1: Backend API (if running)
            const res = await api.get('/projects', { params }).catch(() => null);
            if (res) return res;

            // Priority 2: Firestore direct
            const data = await fsProjects.getAll(params?.status);
            return { data: { projects: data || [] } };
        } catch (err) {
            return { data: { projects: [] } };
        }
    },
    getById: async (id) => {
        try {
            const res = await api.get(`/projects/${id}`).catch(() => null);
            if (res) return res;

            const project = await fsProjects.getById(id);
            return { data: { project } };
        } catch (err) {
            return { data: { project: null } };
        }
    },
    create: async (data) => {
        try {
            return await api.post('/projects', data);
        } catch (error) {
            console.warn("Backend POST /projects failed, using Firestore fallback.", error);
            const doc = await fsProjects.create(data);
            return { data: { project: doc } };
        }
    },
    update: async (id, data) => {
        try {
            return await api.put(`/projects/${id}`, data);
        } catch (error) {
            console.warn("Backend PUT /projects failed, using Firestore fallback.", error);
            await fsProjects.update(id, data);
            return { data: { project: { id, ...data } } };
        }
    },
    delete: async (id) => {
        try {
            return await api.delete(`/projects/${id}`);
        } catch (error) {
            console.warn("Backend DELETE /projects failed, using Firestore fallback.", error);
            await fsProjects.delete(id);
            return { data: { success: true } };
        }
    },
};

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
    syncUser: (data) => api.post('/auth/sync', data),
};

// ── Users ─────────────────────────────────────────────────
export const usersAPI = {
    getById: async (uid) => {
        try {
            const res = await api.get(`/users/${uid}`).catch(() => null);
            if (res) return res;

            const user = await fsUsers.getById(uid);
            return { data: { user } };
        } catch (err) {
            return { data: { user: null } };
        }
    },
    update: (uid, data) => fsUsers.update(uid, data),
    delete: async (uid) => {
        try {
            return await api.delete(`/users/${uid}`);
        } catch (error) {
            console.warn("Backend /users DELETE failed, using Firestore fallback.", error);
            await fsUsers.delete(uid);
            return { data: { success: true } };
        }
    },
};

// ── Admin ─────────────────────────────────────────────────
export const adminAPI = {
    getAnalytics: async () => {
        try {
            // Try backend first
            const res = await api.get('/admin/analytics').catch(() => null);
            if (res && res.data && res.data.analytics) {
                const a = res.data.analytics;
                const summary = {
                    totalUsers: a.totalUsers || 0,
                    totalProjects: a.totalProjects || 0,
                    activeDomains: a.totalTags || 0,
                    pendingApprovals: a.projectsByStatus?.pending || 0,
                };
                return { data: { summary, stats: summary } };
            }

            // Otherwise, aggregate from Firestore
            const [users, projects, domains] = await Promise.all([
                fsUsers.getAll(),
                fsProjects.getAll(),
                fsDomains.getAll()
            ]);

            const summary = {
                totalUsers: users.length,
                totalProjects: projects.length,
                activeDomains: domains.length,
                pendingApprovals: projects.filter(p => p.status === 'pending').length,
                totalViews: 0,
            };

            return { data: { summary, stats: summary } };
        } catch (err) {
            return { data: { summary: { totalUsers: 0, totalProjects: 0, activeDomains: 0, pendingApprovals: 0 } } };
        }
    },
    getUsers: async (params) => {
        try {
            const res = await api.get('/users', { params }).catch(() => null);
            if (res?.data) return res;

            const users = await fsUsers.getAll();
            return { data: { users: users || [] } };
        } catch (err) {
            return { data: { users: [] } };
        }
    },
    createUser: async (uid, data) => {
        try {
            return await api.post('/users', { uid, ...data });
        } catch (error) {
            console.warn("Backend /users POST failed, using Firestore fallback.", error);
            await fsUsers.create(uid, data);
            return { data: { user: data } };
        }
    },
    updateUser: (uid, data) => fsUsers.update(uid, data),
    approveProject: async (id) => {
        try { return await api.post(`/admin/projects/${id}/review`, { action: 'approve' }); }
        catch (error) {
            console.warn("Backend API failed, using Firestore fallback.", error);
            await fsProjects.update(id, { status: 'approved' });
            return { data: { success: true } };
        }
    },
    rejectProject: async (id) => {
        try { return await api.post(`/admin/projects/${id}/review`, { action: 'reject' }); }
        catch (error) {
            console.warn("Backend API failed, using Firestore fallback.", error);
            await fsProjects.update(id, { status: 'rejected' });
            return { data: { success: true } };
        }
    },
    resetProject: async (id) => {
        try { return await api.post(`/admin/projects/${id}/review`, { action: 'pending' }); }
        catch (error) {
            console.warn("Backend API failed, using Firestore fallback.", error);
            await fsProjects.update(id, { status: 'pending' });
            return { data: { success: true } };
        }
    },
};

// ── Tags / Domains ───────────────────────────────────────
export const tagsAPI = {
    getAll: async () => {
        try {
            const res = await api.get('/tags').catch(() => null);
            if (res) return res;

            const tags = await fsDomains.getAll();
            return { data: { tags: tags || [] } };
        } catch (err) {
            return { data: { tags: [] } };
        }
    },
    create: async (data) => {
        try {
            return await api.post('/tags', data);
        } catch (error) {
            console.warn("Backend /tags POST failed, using Firestore fallback.", error);
            const doc = await fsDomains.create(data);
            return { data: { tag: doc } };
        }
    },
    update: async (id, data) => {
        try {
            return await api.put(`/tags/${id}`, data);
        } catch (error) {
            console.warn("Backend /tags PUT failed, using Firestore fallback.", error);
            await fsDomains.update(id, data);
            return { data: { tag: { id, ...data } } };
        }
    },
    delete: async (id) => {
        try {
            return await api.delete(`/tags/${id}`);
        } catch (error) {
            console.warn("Backend /tags DELETE failed, using Firestore fallback.", error);
            await fsDomains.delete(id);
            return { data: { success: true } };
        }
    },
};

// ── Assets ────────────────────────────────────────────────
export const assetsAPI = {
    upload: (projectId, formData) =>
        api.post(`/projects/${projectId}/assets`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    uploadAsset: (formData, onUploadProgress) => api.post('/assets/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
    }),
    listProjectAssets: (projectId) => api.get(`/projects/${projectId}/assets`),
    delete: (assetId) => api.delete(`/assets/${assetId}`),
    deleteFromProject: (projectId, assetId) => api.delete(`/projects/${projectId}/assets/${assetId}`),
};

// ── Events ────────────────────────────────────────────────
export const eventsAPI = {
    getAll: () => api.get('/events'),
    getById: (id) => api.get(`/events/${id}`),
    create: (data) => api.post('/events', data),
    update: (id, data) => api.put(`/events/${id}`, data),
    delete: (id) => api.delete(`/events/${id}`),
};

// ── Search ────────────────────────────────────────────────
export const searchAPI = {
    search: async (query) => {
        try {
            // Priority 1: Backend Search API
            const res = await api.get('/search', { params: { q: query } }).catch(() => null);
            if (res) return res;

            // Priority 2: Firestore/Mock fallback (simplified)
            // For now, we search in Firestore results (not implemented here, but removing mock)
            return { data: { results: [] } };
        } catch (err) {
            return { data: { results: [] } };
        }
    }
};

export default api;
