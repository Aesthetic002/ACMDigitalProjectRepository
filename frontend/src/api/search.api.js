import axiosInstance from './axiosInstance';

export const searchAPI = {
    search: (params) => axiosInstance.get('/search', { params }),
};
