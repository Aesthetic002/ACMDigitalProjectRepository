/**
 * Firebase Service - Mock Data Mode
 *
 * This version provides mock Firestore operations for frontend-only development.
 * No Firebase connection required.
 */

import {
    mockUsers,
    mockProjects,
    mockTags,
} from '@/data/mockData';

// In-memory stores (shared with api.js through imports)
let usersStore = [...mockUsers];
let projectsStore = [...mockProjects];
let tagsStore = [...mockTags];

const generateId = () => `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const serverTimestamp = () => ({ _seconds: Math.floor(Date.now() / 1000) });

// ─── USERS / MEMBERS ──────────────────────────────────────────────────────────

export const fsUsers = {
    /** Get all users */
    getAll: async () => {
        return usersStore.map(u => ({ ...u }));
    },

    /** Get a single user by UID */
    getById: async (uid) => {
        const user = usersStore.find(u => u.uid === uid);
        return user ? { ...user } : null;
    },

    /** Create or overwrite a user document */
    create: async (uid, data) => {
        const existingIndex = usersStore.findIndex(u => u.uid === uid);
        const userData = {
            uid,
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (existingIndex !== -1) {
            usersStore[existingIndex] = userData;
        } else {
            usersStore.push(userData);
        }
        console.log('[Mock Firestore] User created/updated:', uid);
    },

    /** Update fields on an existing user document */
    update: async (uid, data) => {
        const index = usersStore.findIndex(u => u.uid === uid);
        if (index !== -1) {
            usersStore[index] = {
                ...usersStore[index],
                ...data,
                updatedAt: serverTimestamp(),
            };
            console.log('[Mock Firestore] User updated:', uid);
        }
    },

    /** Delete a user document */
    delete: async (uid) => {
        const index = usersStore.findIndex(u => u.uid === uid);
        if (index !== -1) {
            usersStore.splice(index, 1);
            console.log('[Mock Firestore] User deleted:', uid);
        }
    },
};

// ─── PROJECTS ──────────────────────────────────────────────────────────────────

export const fsProjects = {
    /** Get all projects, optionally filter by status */
    getAll: async (status = null) => {
        let projects = projectsStore.map(p => ({ ...p }));
        if (status) {
            projects = projects.filter(p => p.status === status);
        }
        return projects;
    },

    /** Get a single project */
    getById: async (id) => {
        const project = projectsStore.find(p => p.id === id);
        return project ? { ...project } : null;
    },

    /** Create a new project */
    create: async (data) => {
        const newProject = {
            id: generateId(),
            ...data,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        projectsStore.unshift(newProject);
        console.log('[Mock Firestore] Project created:', newProject.id);
        return newProject.id;
    },

    /** Update project fields */
    update: async (id, data) => {
        const index = projectsStore.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsStore[index] = {
                ...projectsStore[index],
                ...data,
                updatedAt: serverTimestamp(),
            };
            console.log('[Mock Firestore] Project updated:', id);
        }
    },

    /** Delete a project permanently */
    delete: async (id) => {
        const index = projectsStore.findIndex(p => p.id === id);
        if (index !== -1) {
            projectsStore.splice(index, 1);
            console.log('[Mock Firestore] Project deleted:', id);
        }
    },
};

// ─── DOMAINS / TAGS ──────────────────────────────────────────────────────────

export const fsDomains = {
    /** Get all domains */
    getAll: async () => {
        return tagsStore.map(t => ({ ...t }));
    },

    /** Create a new domain */
    create: async (name) => {
        const newTag = {
            id: generateId(),
            name: typeof name === 'string' ? name : name.name,
            projectCount: 0,
            createdAt: serverTimestamp(),
        };
        tagsStore.push(newTag);
        console.log('[Mock Firestore] Domain created:', newTag.name);
        return newTag.id;
    },

    /** Update a domain */
    update: async (id, data) => {
        const index = tagsStore.findIndex(t => t.id === id);
        if (index !== -1) {
            tagsStore[index] = { ...tagsStore[index], ...data };
            console.log('[Mock Firestore] Domain updated:', id);
        }
    },

    /** Delete a domain */
    delete: async (id) => {
        const index = tagsStore.findIndex(t => t.id === id);
        if (index !== -1) {
            tagsStore.splice(index, 1);
            console.log('[Mock Firestore] Domain deleted:', id);
        }
    },
};

// ─── ADMIN ACCOUNT CREATION (Mock) ────────────────────────────────────────────

export const createAdminAccount = async ({ email, password, name }) => {
    const newAdmin = {
        uid: `admin-${Date.now()}`,
        email,
        name,
        role: 'admin',
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    usersStore.push(newAdmin);
    console.log('[Mock Firestore] Admin account created:', email);
    return newAdmin;
};

// ─── SEED DEMO DATA (No-op in mock mode) ──────────────────────────────────────

export const seedDemoData = async () => {
    console.log('[Mock Firestore] Demo data already seeded from mockData.js');
};

// Console notification
console.log('%c[MOCK FIRESTORE] Running with mock Firestore operations',
    'color: #06B6D4; font-weight: bold; font-size: 12px;');
