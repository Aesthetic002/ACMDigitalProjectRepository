/**
 * API Service - Mock Data Mode
 *
 * This version uses local mock data instead of backend API calls.
 * Use this for frontend-only development without backend dependencies.
 *
 * To switch back to real API mode, restore the original api.js from the main branch.
 */

import {
    mockUsers,
    mockProjects,
    mockTags,
    mockEvents,
    mockAnalytics,
    mockSearchResults,
    getProjectById,
    getUserById,
    getProjectsByStatus,
    getPendingProjects,
} from '@/data/mockData';

// Simulate network delay for realistic UX testing
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// In-memory storage for mutations (persists during session)
let projectsStore = [...mockProjects];
let usersStore = [...mockUsers];
let tagsStore = [...mockTags];
let eventsStore = [...mockEvents];

// ── Projects ──────────────────────────────────────────────────────────────────

export const projectsAPI = {
    getAll: async (params = {}) => {
        await delay();
        let projects = [...projectsStore];

        if (params.status && params.status !== 'all') {
            projects = projects.filter(p => p.status === params.status);
        }
        if (params.techStack) {
            projects = projects.filter(p =>
                p.techStack.some(t => t.toLowerCase().includes(params.techStack.toLowerCase()))
            );
        }
        if (params.limit) {
            projects = projects.slice(0, params.limit);
        }

        return { data: { projects } };
    },

    getById: async (id) => {
        await delay();
        const project = projectsStore.find(p => p.id === id);
        return { data: { project: project || null } };
    },

    create: async (data) => {
        await delay(500);
        const newProject = {
            id: generateId(),
            ...data,
            status: 'pending',
            views: 0,
            likes: 0,
            createdAt: { _seconds: Math.floor(Date.now() / 1000) },
            updatedAt: { _seconds: Math.floor(Date.now() / 1000) },
        };
        projectsStore.unshift(newProject);
        console.log('[Mock API] Project created:', newProject.title);
        return { data: { project: newProject } };
    },

    update: async (id, data) => {
        await delay(400);
        const index = projectsStore.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsStore[index] = {
                ...projectsStore[index],
                ...data,
                updatedAt: { _seconds: Math.floor(Date.now() / 1000) },
            };
            console.log('[Mock API] Project updated:', id);
            return { data: { project: projectsStore[index] } };
        }
        throw new Error('Project not found');
    },

    delete: async (id) => {
        await delay(400);
        const index = projectsStore.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsStore.splice(index, 1);
            console.log('[Mock API] Project deleted:', id);
            return { data: { success: true } };
        }
        throw new Error('Project not found');
    },
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authAPI = {
    syncUser: async (data) => {
        await delay();
        console.log('[Mock API] User synced:', data.email);
        return { data: { success: true, user: data } };
    },
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const usersAPI = {
    getById: async (uid) => {
        await delay();
        const user = usersStore.find(u => u.uid === uid);
        return { data: { user: user || null } };
    },

    update: async (uid, data) => {
        await delay(400);
        const index = usersStore.findIndex(u => u.uid === uid);
        if (index !== -1) {
            usersStore[index] = {
                ...usersStore[index],
                ...data,
                updatedAt: { _seconds: Math.floor(Date.now() / 1000) },
            };
            console.log('[Mock API] User updated:', uid);
            return { data: { user: usersStore[index] } };
        }
        // If user doesn't exist, create them
        const newUser = { uid, ...data, createdAt: { _seconds: Math.floor(Date.now() / 1000) } };
        usersStore.push(newUser);
        return { data: { user: newUser } };
    },

    delete: async (uid) => {
        await delay(400);
        const index = usersStore.findIndex(u => u.uid === uid);
        if (index !== -1) {
            usersStore.splice(index, 1);
            console.log('[Mock API] User deleted:', uid);
            return { data: { success: true } };
        }
        throw new Error('User not found');
    },
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminAPI = {
    getAnalytics: async () => {
        await delay();
        // Calculate live stats from current store
        const summary = {
            totalUsers: usersStore.length,
            totalProjects: projectsStore.length,
            activeDomains: tagsStore.length,
            pendingApprovals: projectsStore.filter(p => p.status === 'pending').length,
            totalViews: projectsStore.reduce((sum, p) => sum + (p.views || 0), 0),
            totalEvents: eventsStore.length,
        };

        return {
            data: {
                summary,
                stats: summary,
                distribution: mockAnalytics.distribution,
                analytics: {
                    ...mockAnalytics,
                    totalUsers: summary.totalUsers,
                    totalProjects: summary.totalProjects,
                    totalTags: summary.activeDomains,
                    projectsByStatus: {
                        approved: projectsStore.filter(p => p.status === 'approved').length,
                        pending: projectsStore.filter(p => p.status === 'pending').length,
                        rejected: projectsStore.filter(p => p.status === 'rejected').length,
                    },
                },
            }
        };
    },

    getUsers: async (params = {}) => {
        await delay();
        let users = [...usersStore];
        if (params.limit) {
            users = users.slice(0, params.limit);
        }
        return { data: { users } };
    },

    createUser: async (uid, data) => {
        await delay(500);
        const newUser = {
            uid,
            ...data,
            createdAt: { _seconds: Math.floor(Date.now() / 1000) },
            updatedAt: { _seconds: Math.floor(Date.now() / 1000) },
        };
        usersStore.push(newUser);
        console.log('[Mock API] User created:', newUser.email);
        return { data: { user: newUser } };
    },

    updateUser: async (uid, data) => {
        return usersAPI.update(uid, data);
    },

    approveProject: async (id) => {
        await delay(500);
        const index = projectsStore.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsStore[index].status = 'approved';
            projectsStore[index].updatedAt = { _seconds: Math.floor(Date.now() / 1000) };
            console.log('[Mock API] Project approved:', id);
            return { data: { success: true, project: projectsStore[index] } };
        }
        throw new Error('Project not found');
    },

    rejectProject: async (id) => {
        await delay(500);
        const index = projectsStore.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsStore[index].status = 'rejected';
            projectsStore[index].updatedAt = { _seconds: Math.floor(Date.now() / 1000) };
            console.log('[Mock API] Project rejected:', id);
            return { data: { success: true, project: projectsStore[index] } };
        }
        throw new Error('Project not found');
    },

    resetProject: async (id) => {
        await delay(500);
        const index = projectsStore.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsStore[index].status = 'pending';
            projectsStore[index].updatedAt = { _seconds: Math.floor(Date.now() / 1000) };
            console.log('[Mock API] Project reset to pending:', id);
            return { data: { success: true, project: projectsStore[index] } };
        }
        throw new Error('Project not found');
    },
};

// ── Tags / Domains ────────────────────────────────────────────────────────────

export const tagsAPI = {
    getAll: async () => {
        await delay();
        return { data: { tags: [...tagsStore] } };
    },

    create: async (data) => {
        await delay(500);
        const newTag = {
            id: generateId(),
            name: typeof data === 'string' ? data : data.name,
            description: data.description || '',
            color: data.color || '#3B82F6',
            projectCount: 0,
            createdAt: { _seconds: Math.floor(Date.now() / 1000) },
        };
        tagsStore.push(newTag);
        console.log('[Mock API] Tag created:', newTag.name);
        return { data: { tag: newTag } };
    },

    update: async (id, data) => {
        await delay(400);
        const index = tagsStore.findIndex(t => t.id === id);
        if (index !== -1) {
            tagsStore[index] = { ...tagsStore[index], ...data };
            console.log('[Mock API] Tag updated:', id);
            return { data: { tag: tagsStore[index] } };
        }
        throw new Error('Tag not found');
    },

    delete: async (id) => {
        await delay(400);
        const index = tagsStore.findIndex(t => t.id === id);
        if (index !== -1) {
            tagsStore.splice(index, 1);
            console.log('[Mock API] Tag deleted:', id);
            return { data: { success: true } };
        }
        throw new Error('Tag not found');
    },
};

// ── Assets ────────────────────────────────────────────────────────────────────

export const assetsAPI = {
    upload: async (projectId, formData) => {
        await delay(1000); // Simulate upload time
        const mockAsset = {
            id: generateId(),
            projectId,
            url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
            filename: 'uploaded-file.png',
            type: 'image',
            size: 1024000,
            createdAt: { _seconds: Math.floor(Date.now() / 1000) },
        };
        console.log('[Mock API] Asset uploaded for project:', projectId);
        return { data: { asset: mockAsset } };
    },

    uploadAsset: async (formData, onUploadProgress) => {
        // Simulate upload progress
        for (let i = 0; i <= 100; i += 10) {
            await delay(100);
            onUploadProgress?.({ loaded: i, total: 100 });
        }
        const mockAsset = {
            id: generateId(),
            url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
            filename: 'uploaded-file.png',
            type: 'image',
            size: 1024000,
            createdAt: { _seconds: Math.floor(Date.now() / 1000) },
        };
        console.log('[Mock API] Asset uploaded');
        return { data: { asset: mockAsset } };
    },

    listProjectAssets: async (projectId) => {
        await delay();
        // Return mock assets for the project
        const assets = [
            {
                id: 'asset-001',
                projectId,
                url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
                filename: 'screenshot-1.png',
                type: 'image',
            },
            {
                id: 'asset-002',
                projectId,
                url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                filename: 'screenshot-2.png',
                type: 'image',
            },
        ];
        return { data: { assets } };
    },

    delete: async (assetId) => {
        await delay(400);
        console.log('[Mock API] Asset deleted:', assetId);
        return { data: { success: true } };
    },

    deleteFromProject: async (projectId, assetId) => {
        await delay(400);
        console.log('[Mock API] Asset deleted from project:', projectId, assetId);
        return { data: { success: true } };
    },
};

// ── Events ────────────────────────────────────────────────────────────────────

export const eventsAPI = {
    getAll: async () => {
        await delay();
        return { data: { events: [...eventsStore] } };
    },

    getById: async (id) => {
        await delay();
        const event = eventsStore.find(e => e.id === id);
        return { data: { event: event || null } };
    },

    create: async (data) => {
        await delay(500);
        const newEvent = {
            id: generateId(),
            ...data,
            registered: 0,
            createdAt: { _seconds: Math.floor(Date.now() / 1000) },
        };
        eventsStore.unshift(newEvent);
        console.log('[Mock API] Event created:', newEvent.title);
        return { data: { event: newEvent } };
    },

    update: async (id, data) => {
        await delay(400);
        const index = eventsStore.findIndex(e => e.id === id);
        if (index !== -1) {
            eventsStore[index] = { ...eventsStore[index], ...data };
            console.log('[Mock API] Event updated:', id);
            return { data: { event: eventsStore[index] } };
        }
        throw new Error('Event not found');
    },

    delete: async (id) => {
        await delay(400);
        const index = eventsStore.findIndex(e => e.id === id);
        if (index !== -1) {
            eventsStore.splice(index, 1);
            console.log('[Mock API] Event deleted:', id);
            return { data: { success: true } };
        }
        throw new Error('Event not found');
    },
};

// ── Search ────────────────────────────────────────────────────────────────────

export const searchAPI = {
    search: async (query) => {
        await delay(400);
        if (!query || query.trim() === '') {
            return { data: { results: [] } };
        }
        const results = mockSearchResults.search(query);
        console.log('[Mock API] Search for:', query, '- Found:', results.length, 'results');
        return { data: { results } };
    },
};

// ── Default Export (Axios-like interface) ─────────────────────────────────────

const mockApi = {
    get: async (url, config = {}) => {
        const params = config.params || {};

        if (url === '/projects') return projectsAPI.getAll(params);
        if (url.startsWith('/projects/') && url.endsWith('/assets')) {
            const projectId = url.split('/')[2];
            return assetsAPI.listProjectAssets(projectId);
        }
        if (url.startsWith('/projects/')) return projectsAPI.getById(url.split('/')[2]);
        if (url === '/users') return adminAPI.getUsers(params);
        if (url.startsWith('/users/')) return usersAPI.getById(url.split('/')[2]);
        if (url === '/tags') return tagsAPI.getAll();
        if (url === '/events') return eventsAPI.getAll();
        if (url.startsWith('/events/')) return eventsAPI.getById(url.split('/')[2]);
        if (url === '/admin/analytics') return adminAPI.getAnalytics();
        if (url === '/search') return searchAPI.search(params.q);

        console.warn('[Mock API] Unknown GET endpoint:', url);
        return { data: {} };
    },

    post: async (url, data = {}) => {
        if (url === '/projects') return projectsAPI.create(data);
        if (url === '/users') return adminAPI.createUser(data.uid, data);
        if (url === '/tags') return tagsAPI.create(data);
        if (url === '/events') return eventsAPI.create(data);
        if (url === '/auth/sync') return authAPI.syncUser(data);
        if (url.includes('/review')) {
            const projectId = url.split('/')[3];
            if (data.action === 'approve') return adminAPI.approveProject(projectId);
            if (data.action === 'reject') return adminAPI.rejectProject(projectId);
            if (data.action === 'pending') return adminAPI.resetProject(projectId);
        }
        if (url.includes('/assets')) {
            const projectId = url.split('/')[2];
            return assetsAPI.upload(projectId, data);
        }

        console.warn('[Mock API] Unknown POST endpoint:', url);
        return { data: {} };
    },

    put: async (url, data = {}) => {
        if (url.startsWith('/projects/')) return projectsAPI.update(url.split('/')[2], data);
        if (url.startsWith('/users/')) return usersAPI.update(url.split('/')[2], data);
        if (url.startsWith('/tags/')) return tagsAPI.update(url.split('/')[2], data);
        if (url.startsWith('/events/')) return eventsAPI.update(url.split('/')[2], data);

        console.warn('[Mock API] Unknown PUT endpoint:', url);
        return { data: {} };
    },

    delete: async (url) => {
        if (url.startsWith('/projects/')) return projectsAPI.delete(url.split('/')[2]);
        if (url.startsWith('/users/')) return usersAPI.delete(url.split('/')[2]);
        if (url.startsWith('/tags/')) return tagsAPI.delete(url.split('/')[2]);
        if (url.startsWith('/events/')) return eventsAPI.delete(url.split('/')[2]);
        if (url.startsWith('/assets/')) return assetsAPI.delete(url.split('/')[2]);

        console.warn('[Mock API] Unknown DELETE endpoint:', url);
        return { data: {} };
    },
};

export default mockApi;

// ── Console notification ──────────────────────────────────────────────────────

console.log('%c[MOCK MODE] Frontend running with mock data - no backend required',
    'color: #10B981; font-weight: bold; font-size: 14px;');
