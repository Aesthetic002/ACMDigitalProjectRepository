import axiosInstance from './axiosInstance';

export const adminAPI = {
    getStats: () => axiosInstance.get('/admin/analytics'),
    getPendingProjects: () => axiosInstance.get('/projects', { params: { status: 'pending' } }),
    getAnalytics: () => axiosInstance.get('/admin/analytics'),

    // Review actions
    approveProject: (projectId) => axiosInstance.post(`/admin/projects/${projectId}/review`, { action: 'approve' }),
    rejectProject: (projectId, reason) => axiosInstance.post(`/admin/projects/${projectId}/review`, { action: 'reject', notes: reason }),
    reviewProject: (projectId, data) => axiosInstance.post(`/admin/projects/${projectId}/review`, data),

    // Feature action - wrap boolean in object
    featureProject: (projectId, featured) => axiosInstance.post(`/admin/projects/${projectId}/feature`, { featured }),
};
