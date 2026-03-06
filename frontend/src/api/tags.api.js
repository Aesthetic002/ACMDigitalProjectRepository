import axiosInstance from './axiosInstance';

export const tagsAPI = {
    getAll: () => axiosInstance.get('/tags'),
    create: (data) => axiosInstance.post('/tags', data),
    update: (tagId, data) => axiosInstance.put(`/tags/${tagId}`, data),
    delete: (tagId) => axiosInstance.delete(`/tags/${tagId}`),
};
