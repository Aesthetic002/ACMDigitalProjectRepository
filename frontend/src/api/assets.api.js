import axiosInstance from './axiosInstance';

export const assetsAPI = {
    getUploadUrl: (data) => axiosInstance.post('/assets/upload-url', data),
    listProjectAssets: (projectId) => axiosInstance.get(`/projects/${projectId}/assets`),
    delete: (assetId) => axiosInstance.delete(`/assets/${assetId}`),
};
