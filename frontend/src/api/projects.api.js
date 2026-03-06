import axiosInstance from './axiosInstance';

export const projectsAPI = {
    // READ
    getAll: (params = {}) => axiosInstance.get('/projects', { params }),
    getById: (projectId) => axiosInstance.get(`/projects/${projectId}`),

    // WRITE
    create: (data) => axiosInstance.post('/projects', data),
    update: (projectId, data) => axiosInstance.put(`/projects/${projectId}`, data),
    delete: (projectId) => axiosInstance.delete(`/projects/${projectId}`),
};
