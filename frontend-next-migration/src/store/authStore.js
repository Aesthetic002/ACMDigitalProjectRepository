import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, db, googleProvider, githubProvider } from '../config/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'
import { toast } from 'sonner'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true,
            isAuthenticated: false,

            initAuth: () => {
                const currentState = get();

                // For demo users: resolve loading immediately but don't need a Firebase listener
                if (currentState.isAuthenticated && currentState.user?.isDemoUser) {
                    set({ isLoading: false });
                    return;
                }

                // For real/persisted sessions: resolve loading immediately from persisted state
                // but ALWAYS register the Firebase listener to validate/update the session
                if (currentState.isAuthenticated && currentState.user) {
                    set({ isLoading: false });
                }

                // Safety net: if Firebase doesn't respond in 3s, unblock the app
                const failsafeTimer = setTimeout(() => {
                    if (get().isLoading) {
                        console.warn('Firebase auth timeout — proceeding as guest.');
                        set({ isLoading: false });
                    }
                }, 3000);

                try {
                    onAuthStateChanged(auth, async (firebaseUser) => {
                        clearTimeout(failsafeTimer);
                        if (firebaseUser) {
                            try {
                                let role = 'member';
                                let firestoreData = {};
                                try {
                                    const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
                                    if (userSnap.exists()) {
                                        firestoreData = userSnap.data();
                                        role = firestoreData.role || 'member';
                                    }
                                } catch { /* Firestore offline — keep default role */ }
                                set({
                                    user: {
                                        uid: firebaseUser.uid,
                                        email: firebaseUser.email,
                                        name: firestoreData.name || firebaseUser.displayName || 'User',
                                        photoURL: firebaseUser.photoURL,
                                        role,
                                        ...firestoreData,
                                    },
                                    isAuthenticated: true,
                                    isLoading: false,
                                });
                            } catch (error) {
                                console.error('Auth error:', error);
                                set({ user: null, isAuthenticated: false, isLoading: false });
                            }
                        } else {
                            // Firebase says no active session — only clear if NOT a persisted real user
                            // (this handles cases where Firebase is slow to confirm the session)
                            const persisted = get();
                            if (!persisted.user || persisted.user.isDemoUser) {
                                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                            } else {
                                // Have a real persisted user – wait for Firebase (already set isLoading: false above)
                                // If Firebase says no user, trust it and clear
                                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                            }
                        }
                    });
                } catch (err) {
                    clearTimeout(failsafeTimer);
                    console.error('Firebase init failed:', err.message);
                    set({ isLoading: false });
                }
            },

            login: async (email, password, role = 'member') => {
                set({ isLoading: true })
                try {
                    const result = await signInWithEmailAndPassword(auth, email, password)
                    // If logging in via admin tab, inject role:admin directly into state
                    // (Firestore rules may block client writes, so we force the role in app state)
                    if (role === 'admin') {
                        let firestoreData = {};
                        try {
                            const userSnap = await getDoc(doc(db, 'users', result.user.uid));
                            if (userSnap.exists()) firestoreData = userSnap.data();
                        } catch { /* Firestore offline, use defaults */ }
                        set({
                            user: {
                                uid: result.user.uid,
                                email: result.user.email,
                                name: firestoreData.name || result.user.displayName || email.split('@')[0],
                                photoURL: result.user.photoURL,
                                ...firestoreData,
                                role: 'admin',   // ← always override to admin when logging in via admin tab
                            },
                            isAuthenticated: true,
                            isLoading: false,
                        });
                        toast.success('Welcome, Admin!');
                        return { success: true }
                    }
                    // For regular member login, let onAuthStateChanged handle state
                    toast.success('Welcome back!')
                    return { success: true }
                } catch (error) {
                    const message = getAuthErrorMessage(error.code)
                    toast.error(message)
                    set({ isLoading: false })
                    return { success: false, error: message }
                }
            },

            register: async (email, password, name, role = 'member') => {
                set({ isLoading: true })
                try {
                    const result = await createUserWithEmailAndPassword(auth, email, password)
                    await updateProfile(result.user, { displayName: name })
                    // Write user document to Firestore with role
                    await setDoc(doc(db, 'users', result.user.uid), {
                        uid: result.user.uid,
                        email,
                        name,
                        role,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                    toast.success('Account created successfully!')
                    return { success: true }
                } catch (error) {
                    const message = getAuthErrorMessage(error.code)
                    toast.error(message)
                    set({ isLoading: false })
                    return { success: false, error: message }
                }
            },

            loginWithGoogle: async () => {
                set({ isLoading: true })
                try {
                    await signInWithPopup(auth, googleProvider)
                    toast.success('Welcome!')
                    return { success: true }
                } catch (error) {
                    const message = getAuthErrorMessage(error.code)
                    toast.error(message)
                    set({ isLoading: false })
                    return { success: false, error: message }
                }
            },

            loginWithGithub: async () => {
                set({ isLoading: true })
                try {
                    await signInWithPopup(auth, githubProvider)
                    toast.success('Welcome!')
                    return { success: true }
                } catch (error) {
                    const message = getAuthErrorMessage(error.code)
                    toast.error(message)
                    set({ isLoading: false })
                    return { success: false, error: message }
                }
            },

            logout: async () => {
                try {
                    // Only call Firebase signOut for real accounts
                    const { user } = get();
                    if (!user?.isDemoUser) {
                        await signOut(auth)
                    }
                    set({ user: null, token: null, isAuthenticated: false })
                    toast.success('Logged out successfully')
                } catch {
                    toast.error('Failed to logout')
                }
            },

            updateUser: async (data) => {
                const { user } = get()
                if (!user) return
                try {
                    // Update Firestore directly
                    await setDoc(doc(db, 'users', user.uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
                    set({ user: { ...user, ...data } })
                    toast.success('Profile updated successfully')
                    return { success: true }
                } catch {
                    toast.error('Failed to update profile')
                    return { success: false }
                }
            },

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),

            loginAsDemo: (role = 'admin') => {
                const demoUser = {
                    uid: role === 'admin' ? 'demo-admin-001' : 'demo-member-001',
                    email: role === 'admin' ? 'admin@acm-demo.local' : 'member@acm-demo.local',
                    name: role === 'admin' ? 'Demo Admin' : 'Demo Member',
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}Demo`,
                    role,
                    isDemoUser: true,
                    year: '4th Year',
                    graduationYear: '2025',
                };
                set({
                    user: demoUser,
                    token: 'demo-token',
                    isAuthenticated: true,
                    isLoading: false,
                });
                toast.success(`Demo ${role} session started!`);
            },
        }),
        {
            name: 'auth-storage',
            // Persist the full session so page reloads keep the user logged in
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/email-already-in-use': return 'This email is already registered'
        case 'auth/invalid-email': return 'Invalid email address'
        case 'auth/operation-not-allowed': return 'This sign-in method is not enabled'
        case 'auth/weak-password': return 'Password should be at least 6 characters'
        case 'auth/user-disabled': return 'This account has been disabled'
        case 'auth/user-not-found': return 'No account found with this email'
        case 'auth/wrong-password': return 'Incorrect password'
        case 'auth/invalid-credential': return 'Invalid email or password'
        case 'auth/too-many-requests': return 'Too many failed attempts. Please try again later'
        case 'auth/popup-closed-by-user': return 'Sign-in popup was closed'
        default: return 'An error occurred. Please try again'
    }
}
