/**
 * firebaseService.js
 *
 * Direct Firestore CRUD layer — used when the backend server is unavailable.
 * All reads/writes happen through the Firebase client SDK directly.
 */

import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc,
    deleteDoc, addDoc, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth, db } from '@/config/firebase';

// ─── USERS / MEMBERS ──────────────────────────────────────────────────────────

export const fsUsers = {
    /** Get all users from Firestore */
    getAll: async () => {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
    },

    /** Get a single user by UID */
    getById: async (uid) => {
        const snap = await getDoc(doc(db, 'users', uid));
        return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
    },

    /** Create or overwrite a user document */
    create: async (uid, data) => {
        await setDoc(doc(db, 'users', uid), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    },

    /** Update fields on an existing user document */
    update: async (uid, data) => {
        await updateDoc(doc(db, 'users', uid), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    /** Delete a user document (does NOT delete Firebase Auth account) */
    delete: async (uid) => {
        await deleteDoc(doc(db, 'users', uid));
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
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    /** Get a single project */
    getById: async (id) => {
        const snap = await getDoc(doc(db, 'projects', id));
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    /** Create a new project */
    create: async (data) => {
        const ref = await addDoc(collection(db, 'projects'), {
            ...data,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return ref.id;
    },

    /** Update project fields (e.g. status: 'approved') */
    update: async (id, data) => {
        await updateDoc(doc(db, 'projects', id), {
            ...data,
            updatedAt: serverTimestamp(),
        });
    },

    /** Delete a project permanently */
    delete: async (id) => {
        await deleteDoc(doc(db, 'projects', id));
    },
};

// ─── DOMAINS / TAGS ──────────────────────────────────────────────────────────

export const fsDomains = {
    /** Get all domains */
    getAll: async () => {
        const snap = await getDocs(collection(db, 'tags'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    /** Create a new domain */
    create: async (name) => {
        const ref = await addDoc(collection(db, 'tags'), {
            name,
            projectCount: 0,
            createdAt: serverTimestamp(),
        });
        return ref.id;
    },

    /** Update a domain (e.g. rename) */
    update: async (id, data) => {
        await updateDoc(doc(db, 'tags', id), { ...data });
    },

    /** Delete a domain */
    delete: async (id) => {
        await deleteDoc(doc(db, 'tags', id));
    },
};

// ─── ADMIN ACCOUNT CREATION ──────────────────────────────────────────────────

/**
 * Create a new admin user in Firebase Auth + Firestore.
 * Call this once to bootstrap an admin account.
 */
export const createAdminAccount = async ({ email, password, name }) => {
    // 1. Create in Firebase Auth
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = result;

    // 2. Set display name
    await updateProfile(user, { displayName: name });

    // 3. Write admin document to Firestore
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        name,
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    return user;
};

// ─── SEED DEMO DATA ──────────────────────────────────────────────────────────

/**
 * Seed the Firestore database with demo members, projects, and domains.
 * Only writes entries if the collection is empty.
 */
export const seedDemoData = async () => {
    // Seed domains
    const tagsSnap = await getDocs(collection(db, 'tags'));
    if (tagsSnap.empty) {
        const domains = [
            'Artificial Intelligence', 'Web Development', 'Machine Learning',
            'Cybersecurity', 'Blockchain', 'Cloud Computing', 'IoT'
        ];
        for (const name of domains) {
            await addDoc(collection(db, 'tags'), { name, projectCount: 0, createdAt: serverTimestamp() });
        }
        console.log('✅ Seeded domains');
    }

    console.log('✅ Firestore seed complete');
};
