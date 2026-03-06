import axiosInstance from './axiosInstance';

export const usersAPI = {
    getAll: (params = {}) => axiosInstance.get('/users', { params }),
    getById: (userId) => axiosInstance.get(`/users/${userId}`),
    update: (userId, data) => axiosInstance.put(`/users/${userId}`, data),
};
