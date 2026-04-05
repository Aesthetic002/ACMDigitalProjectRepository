import axiosInstance from '@/api/axiosInstance';
import { useAuthStore } from '@/store/authStore';

export const commentService = {
  createComment: async (projectId, text) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('Authentication required');
    if (!text || text.length < 1 || text.length > 1000) {
      throw new Error('Comment text must be between 1 and 1000 characters');
    }

    const { data } = await axiosInstance.post(`/projects/${projectId}/comments`, { content: text });
    
    // Map backend structure to frontend structure
    return {
      id: data.id,
      projectId: data.projectId,
      userId: data.userId,
      authorName: user.displayName || user.email?.split('@')[0] || ('User ' + data.userId.substring(0, 4)),
      authorAvatar: user.photoURL || '',
      text: data.content,
      likes: data.upvotes || 0,
      likedBy: [],
      timestamp: data.createdAt,
      edited: false
    };
  },

  getProjectComments: async (projectId) => {
    const response = await axiosInstance.get(`/projects/${projectId}/comments`);
    const data = response.data.comments || response.data || [];
    
    // Attempt local user lookup or default mapping
    const currentUser = useAuthStore.getState().user;
    
    return data.map(c => ({
      id: c.id,
      projectId: c.projectId,
      userId: c.userId,
      authorName: currentUser?.uid === c.userId ? (currentUser.displayName || currentUser.email?.split('@')[0]) : ('User ' + c.userId.substring(0, 4)),
      authorAvatar: currentUser?.uid === c.userId ? (currentUser.photoURL || '') : '',
      text: c.content,
      likes: c.upvotes || 0,
      likedBy: [],
      timestamp: c.createdAt
    }));
  },

  getProjectCommentsSorted: async (projectId, sortBy = 'recent', limit = 50) => {
    const sortParams = (sortBy === 'ml-top' || sortBy === 'likes' || sortBy === 'upvotes') ? '?sort=true' : '';
    const response = await axiosInstance.get(`/projects/${projectId}/comments${sortParams}`);
    const data = response.data.comments || response.data || [];
    
    const currentUser = useAuthStore.getState().user;
    
    let mapped = data.map(c => ({
      id: c.id,
      projectId: c.projectId,
      userId: c.userId,
      authorName: currentUser?.uid === c.userId ? (currentUser.displayName || currentUser.email?.split('@')[0]) : ('User ' + c.userId.substring(0, 4)),
      authorAvatar: currentUser?.uid === c.userId ? (currentUser.photoURL || '') : '',
      text: c.content,
      likes: c.upvotes || 0,
      likedBy: [],
      timestamp: c.createdAt
    }));

    if (sortBy === 'recent') {
      mapped = mapped.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    return mapped.slice(0, limit);
  },

  likeComment: async (commentId) => {
    const { data } = await axiosInstance.post(`/comments/${commentId}/upvote`);
    return {
      id: data.id,
      likes: data.upvotes
    };
  },

  updateComment: async (commentId, text) => {
    throw new Error('Not implemented in microservice');
  },

  deleteComment: async (commentId) => {
    await axiosInstance.delete(`/comments/${commentId}`);
    return true;
  },

  adminDeleteComment: async (commentId) => {
    await axiosInstance.delete(`/comments/${commentId}`);
    return true;
  }
};
