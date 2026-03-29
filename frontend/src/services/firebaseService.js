/**
 * Firebase Service - Production Mode
 *
 * Real Firestore operations for direct database access.
 * Note: Most operations should go through the backend API.
 * This is for cases where direct Firestore access is needed.
 */

import { db } from '@/config/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
} from 'firebase/firestore';

// ─── USERS / MEMBERS ──────────────────────────────────────────────────────────

export const fsUsers = {
    /** Get all users */
    getAll: async () => {
        const snapshot = await getDocs(collection(db, 'users'));
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    },

    /** Get a single user by UID */
    getById: async (uid) => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { uid: docSnap.id, ...docSnap.data() } : null;
    },

    /** Create or overwrite a user document */
    create: async (uid, data) => {
        const docRef = doc(db, 'users', uid);
        await setDoc(docRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log('[Firestore] User created/updated:', uid);
    },

    /** Update fields on an existing user document */
    update: async (uid, data) => {
        const docRef = doc(db, 'users', uid);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        console.log('[Firestore] User updated:', uid);
    },

    /** Delete a user document */
    delete: async (uid) => {
        const docRef = doc(db, 'users', uid);
        await deleteDoc(docRef);
        console.log('[Firestore] User deleted:', uid);
    },
};

// ─── PROJECTS ──────────────────────────────────────────────────────────────────

export const fsProjects = {
    /** Get all projects, optionally filter by status */
    getAll: async (status = null) => {
        let q = collection(db, 'projects');
        if (status) {
            q = query(q, where('status', '==', status));
        }
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /** Get a single project */
    getById: async (id) => {
        const docRef = doc(db, 'projects', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    },

    /** Create a new project */
    create: async (data) => {
        const docRef = doc(collection(db, 'projects'));
        await setDoc(docRef, {
            ...data,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log('[Firestore] Project created:', docRef.id);
        return docRef.id;
    },

    /** Update project fields */
    update: async (id, data) => {
        const docRef = doc(db, 'projects', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
        console.log('[Firestore] Project updated:', id);
    },

    /** Delete a project permanently */
    delete: async (id) => {
        const docRef = doc(db, 'projects', id);
        await deleteDoc(docRef);
        console.log('[Firestore] Project deleted:', id);
    },
};

// ─── DOMAINS / TAGS ──────────────────────────────────────────────────────────

export const fsDomains = {
    /** Get all domains */
    getAll: async () => {
        const snapshot = await getDocs(collection(db, 'tags'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /** Create a new domain */
    create: async (name) => {
        const docRef = doc(collection(db, 'tags'));
        await setDoc(docRef, {
            name: typeof name === 'string' ? name : name.name,
            projectCount: 0,
            createdAt: serverTimestamp(),
        });
        console.log('[Firestore] Domain created:', docRef.id);
        return docRef.id;
    },

    /** Update a domain */
    update: async (id, data) => {
        const docRef = doc(db, 'tags', id);
        await updateDoc(docRef, data);
        console.log('[Firestore] Domain updated:', id);
    },

    /** Delete a domain */
    delete: async (id) => {
        const docRef = doc(db, 'tags', id);
        await deleteDoc(docRef);
        console.log('[Firestore] Domain deleted:', id);
    },
};

// ─── ADMIN ACCOUNT CREATION ────────────────────────────────────────────────────

export const createAdminAccount = async ({ email, password, name }) => {
    // Note: Admin creation should be done through backend for security
    // This is just a placeholder for Firestore user document creation
    const uid = `admin-${Date.now()}`;
    await fsUsers.create(uid, {
        email,
        name,
        role: 'admin',
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    });
    console.log('[Firestore] Admin account created:', email);
    return { uid, email, name, role: 'admin' };
};

// ─── SEED DEMO DATA ──────────────────────────────────────────────────────────

export const seedDemoData = async () => {
    console.log('[Firestore] Seeding should be done through backend API');
};

console.log('%c[Firestore] Firebase Firestore initialized', 'color: #4CAF50; font-weight: bold;');
