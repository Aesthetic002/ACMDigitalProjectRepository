/**
 * Comment Service - Mock Data Mode
 * 
 * Handles all comment-related operations with mock data
 * No backend required - works with in-memory storage
 */

// Simulate network delay for realistic UX testing
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
const generateId = () => `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock comment data storage (in-memory, persists during session)
let commentsStore = [];

// Mock users for comment authors
const mockAuthors = [
  { name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
  { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?img=2" },
  { name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=3" },
  { name: "Emily Davis", avatar: "https://i.pravatar.cc/150?img=4" },
  { name: "David Wilson", avatar: "https://i.pravatar.cc/150?img=5" },
  { name: "Jessica Martinez", avatar: "https://i.pravatar.cc/150?img=6" },
  { name: "Ryan Thompson", avatar: "https://i.pravatar.cc/150?img=7" },
  { name: "Olivia Garcia", avatar: "https://i.pravatar.cc/150?img=8" },
  { name: "James Lee", avatar: "https://i.pravatar.cc/150?img=9" },
  { name: "Sophia Anderson", avatar: "https://i.pravatar.cc/150?img=10" },
];

const commentTexts = [
  "This project is absolutely brilliant! The implementation is clean and well thought out. Great work!",
  "I love the approach you took here. Very innovative solution to a common problem.",
  "Excellent documentation! Made it super easy to understand and contribute.",
  "The UI/UX is phenomenal. Really smooth user experience.",
  "Amazing work! This solved exactly what I was looking for.",
  "Well done! The code quality is top-notch and the performance is impressive.",
  "This is a game-changer. Can't wait to see where this project goes!",
  "Great attention to detail. Everything works flawlessly.",
  "Impressive implementation! The technical decisions made here are solid.",
  "Really appreciate the effort put into this. Learned a lot from the codebase.",
];

const getRandomCommentText = () => {
  return commentTexts[Math.floor(Math.random() * commentTexts.length)];
};

// Initialize with some mock comments for a project
const initializeMockComments = (projectId) => {
  const existingComments = commentsStore.filter(c => c.projectId === projectId);
  
  if (existingComments.length === 0) {
    // Add 5 initial comments for this project
    for (let i = 0; i < 5; i++) {
      const author = mockAuthors[i % mockAuthors.length];
      const daysAgo = Math.floor(Math.random() * 180); // Random date within last 6 months
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
      
      commentsStore.push({
        id: generateId(),
        projectId,
        userId: `mock_user_${i}`,
        authorName: author.name,
        authorAvatar: author.avatar,
        text: getRandomCommentText(),
        likes: Math.floor(Math.random() * 50),
        likedBy: [],
        timestamp,
        edited: false,
        editedAt: null,
      });
    }
  }
};

// Get current user from auth store
const getCurrentUser = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.user || null;
    }
  } catch (e) {
    console.error('Error getting current user:', e);
  }
  return null;
};

// Sort comments based on criteria
const sortComments = (comments, sortBy) => {
  const sorted = [...comments];
  
  switch (sortBy) {
    case 'recent':
      return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    case 'likes':
      return sorted.sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
    
    case 'ml-top':
      // ML-based scoring
      const now = Date.now();
      const DAY_MS = 24 * 60 * 60 * 1000;
      
      return sorted.map(comment => {
        const maxLikes = Math.max(...sorted.map(c => c.likes), 1);
        const likesScore = (comment.likes / maxLikes) * 0.4;
        
        const commentAge = now - new Date(comment.timestamp).getTime();
        const daysSince = commentAge / DAY_MS;
        const recencyScore = Math.max(0, 1 - daysSince / 180) * 0.3;
        
        const textLength = comment.text.length;
        let relevanceScore = 0;
        if (textLength >= 50 && textLength <= 500) {
          relevanceScore = 0.15;
        } else if (textLength > 20 && textLength < 1000) {
          relevanceScore = 0.05;
        }
        
        const mlScore = likesScore + recencyScore + relevanceScore;
        
        return { ...comment, mlScore };
      }).sort((a, b) => b.mlScore - a.mlScore);
    
    default:
      return sorted;
  }
};

/**
 * Comment Service API (Mock Mode)
 */
export const commentService = {
  /**
   * Create a new comment
   */
  createComment: async (projectId, text) => {
    await delay();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { message: 'Authentication required' };
    }
    
    if (!text || text.length < 1 || text.length > 5000) {
      throw { message: 'Comment text must be between 1 and 5000 characters' };
    }
    
    const newComment = {
      id: generateId(),
      projectId,
      userId: currentUser.uid,
      authorName: currentUser.name || 'Anonymous',
      authorAvatar: currentUser.photoURL || '',
      text: text.trim(),
      likes: 0,
      likedBy: [],
      timestamp: new Date().toISOString(),
      edited: false,
      editedAt: null,
    };
    
    commentsStore.push(newComment);
    
    return {
      success: true,
      message: 'Comment created successfully',
      comment: newComment,
    };
  },

  /**
   * Get all comments for a project
   */
  getProjectComments: async (projectId) => {
    await delay();
    
    // Initialize comments for this project if none exist
    initializeMockComments(projectId);
    
    const comments = commentsStore.filter(c => c.projectId === projectId);
    
    return {
      success: true,
      comments: comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
      count: comments.length,
    };
  },

  /**
   * Get sorted comments for a project
   */
  getProjectCommentsSorted: async (projectId, sortBy = 'recent', limit = 50) => {
    await delay();
    
    // Initialize comments for this project if none exist
    initializeMockComments(projectId);
    
    let comments = commentsStore.filter(c => c.projectId === projectId);
    comments = sortComments(comments, sortBy);
    comments = comments.slice(0, limit);
    
    return {
      success: true,
      comments,
      count: comments.length,
      sortBy,
    };
  },

  /**
   * Like or unlike a comment
   */
  likeComment: async (commentId) => {
    await delay(200);
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { message: 'Authentication required' };
    }
    
    const comment = commentsStore.find(c => c.id === commentId);
    if (!comment) {
      throw { message: 'Comment not found' };
    }
    
    const alreadyLiked = comment.likedBy.includes(currentUser.uid);
    
    if (alreadyLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(uid => uid !== currentUser.uid);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(currentUser.uid);
      comment.likes += 1;
    }
    
    return {
      success: true,
      message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
      liked: !alreadyLiked,
      likes: comment.likes,
    };
  },

  /**
   * Edit a comment
   */
  updateComment: async (commentId, text) => {
    await delay();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { message: 'Authentication required' };
    }
    
    if (!text || text.length < 1 || text.length > 5000) {
      throw { message: 'Comment text must be between 1 and 5000 characters' };
    }
    
    const comment = commentsStore.find(c => c.id === commentId);
    if (!comment) {
      throw { message: 'Comment not found' };
    }
    
    if (comment.userId !== currentUser.uid && currentUser.role !== 'admin') {
      throw { message: 'You can only edit your own comments' };
    }
    
    comment.text = text.trim();
    comment.edited = true;
    comment.editedAt = new Date().toISOString();
    
    return {
      success: true,
      message: 'Comment updated successfully',
      comment,
    };
  },

  /**
   * Delete own comment
   */
  deleteComment: async (commentId) => {
    await delay();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw { message: 'Authentication required' };
    }
    
    const index = commentsStore.findIndex(c => c.id === commentId);
    if (index === -1) {
      throw { message: 'Comment not found' };
    }
    
    const comment = commentsStore[index];
    if (comment.userId !== currentUser.uid && currentUser.role !== 'admin') {
      throw { message: 'You can only delete your own comments' };
    }
    
    commentsStore.splice(index, 1);
    
    return {
      success: true,
      message: 'Comment deleted successfully',
    };
  },

  /**
   * Admin delete any comment
   */
  adminDeleteComment: async (commentId) => {
    await delay();
    
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      throw { message: 'Admin access required' };
    }
    
    const index = commentsStore.findIndex(c => c.id === commentId);
    if (index === -1) {
      throw { message: 'Comment not found' };
    }
    
    commentsStore.splice(index, 1);
    
    return {
      success: true,
      message: 'Comment deleted by admin',
    };
  },
};

export default commentService;

// Console notification
console.log('%c[MOCK COMMENTS] Running in mock comment mode - no backend required',
  'color: #10B981; font-weight: bold; font-size: 12px;');
