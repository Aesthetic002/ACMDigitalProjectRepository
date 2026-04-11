/**
 * API Service - Production Mode
 *
 * Real backend API calls using axiosInstance.
 */

import axiosInstance from '@/api/axiosInstance';

// ── Projects ──────────────────────────────────────────────────────────────────

export const projectsAPI = {
    getAll: (params = {}) => axiosInstance.get('/projects', { params }),
    getById: (id) => axiosInstance.get(`/projects/${id}`),
    create: (data) => axiosInstance.post('/projects', data),
    update: (id, data) => axiosInstance.put(`/projects/${id}`, data),
    delete: (id) => axiosInstance.delete(`/projects/${id}`),
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authAPI = {
    verify: () => axiosInstance.post('/auth/verify'),
    syncUser: (data) => axiosInstance.post('/auth/sync', data),
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersAPI = {
    getById: (uid) => axiosInstance.get(`/users/${uid}`),
    getAll: (params = {}) => axiosInstance.get('/users', { params }),
    create: (data) => axiosInstance.post('/users', data),
    update: (uid, data) => axiosInstance.put(`/users/${uid}`, data),
    delete: (uid) => axiosInstance.delete(`/users/${uid}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminAPI = {
    getAnalytics: () => axiosInstance.get('/admin/analytics'),
    getUsers: (params = {}) => axiosInstance.get('/users', { params }),
    createUser: (uid, data) => axiosInstance.post('/users', { uid, ...data }),
    updateUser: (uid, data) => axiosInstance.put(`/users/${uid}`, data),
    deleteUser: (uid) => axiosInstance.delete(`/users/${uid}`),
    approveProject: (id) => axiosInstance.post(`/admin/projects/${id}/review`, { action: 'approve' }),
    rejectProject: (id) => axiosInstance.post(`/admin/projects/${id}/review`, { action: 'reject' }),
    resetProject: (id) => axiosInstance.post(`/admin/projects/${id}/review`, { action: 'pending' }),
};

// ── Tags / Domains ────────────────────────────────────────────────────────────

export const tagsAPI = {
    getAll: () => axiosInstance.get('/tags'),
    create: (data) => axiosInstance.post('/tags', data),
    update: (id, data) => axiosInstance.put(`/tags/${id}`, data),
    delete: (id) => axiosInstance.delete(`/tags/${id}`),
};

export const domainsAPI = {
    getStats: () => axiosInstance.get('/domains/stats'),
};

// ── Comments ──────────────────────────────────────────────────────────────────

export const commentsAPI = {
    getSorted: (projectId, params = {}) => axiosInstance.get(`/comments/project/${projectId}/sorted`, { params }),
    create: (data) => axiosInstance.post('/comments', data),
    like: (commentId) => axiosInstance.put(`/comments/${commentId}/like`),
    update: (commentId, data) => axiosInstance.put(`/comments/${commentId}`, data),
    delete: (commentId) => axiosInstance.delete(`/comments/${commentId}`),
    adminDelete: (commentId) => axiosInstance.delete(`/comments/${commentId}/admin`),
};

// ── Assets ────────────────────────────────────────────────────────────────────

export const assetsAPI = {
    upload: (projectId, formData) => 
        axiosInstance.post(`/projects/${projectId}/assets`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    uploadAsset: (formData, onUploadProgress) =>
        axiosInstance.post('/assets/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress,
        }),
    getUploadUrl: (data) => axiosInstance.post('/assets/upload-url', data),
    listProjectAssets: (projectId) => axiosInstance.get(`/projects/${projectId}/assets`),
    delete: (assetId) => axiosInstance.delete(`/assets/${assetId}`),
    deleteFromProject: (projectId, assetId) => 
        axiosInstance.delete(`/projects/${projectId}/assets/${assetId}`),
};

// ── Events ────────────────────────────────────────────────────────────────────

export const eventsAPI = {
    getAll: () => axiosInstance.get('/events'),
    getById: (id) => axiosInstance.get(`/events/${id}`),
    create: (data) => axiosInstance.post('/events', data),
    update: (id, data) => axiosInstance.put(`/events/${id}`, data),
    delete: (id) => axiosInstance.delete(`/events/${id}`),
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchAPI = {
    search: (params = {}) => axiosInstance.get('/search', { params }),
};

// ── Default Export (Axios-like interface for backward compatibility) ──────────

const api = {
    get: (url, config = {}) => axiosInstance.get(url, config),
    post: (url, data = {}, config = {}) => axiosInstance.post(url, data, config),
    put: (url, data = {}, config = {}) => axiosInstance.put(url, data, config),
    delete: (url, config = {}) => axiosInstance.delete(url, config),
};

export default api;

console.log('%c[API] Connected to backend:', 'color: #4CAF50; font-weight: bold;', 
    import.meta.env.VITE_API_URL || 'http://localhost:3000');
