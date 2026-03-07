import axiosInstance from './axiosInstance';

export const authAPI = {
    verify: () => axiosInstance.post('/auth/verify'),
    register: (data) => axiosInstance.post('/auth/verify', data),
};
