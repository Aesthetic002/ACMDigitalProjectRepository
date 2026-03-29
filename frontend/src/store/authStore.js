/**
 * Auth Store - Production Mode
 *
 * Real Firebase authentication with backend API sync.
 * 
 * Roles: viewer (default), contributor, admin
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile,
} from 'firebase/auth'
import { auth, googleProvider, githubProvider } from '@/config/firebase'
import axiosInstance from '@/api/axiosInstance'

// Valid roles
const VALID_ROLES = ['viewer', 'contributor', 'admin'];
const DEFAULT_ROLE = 'viewer';

// Track if auth listener is already set up
let authListenerUnsubscribe = null;

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true,
            isAuthenticated: false,

            initAuth: () => {
                // Prevent multiple listeners
                if (authListenerUnsubscribe) {
                    return authListenerUnsubscribe;
                }

                console.log('[Auth] Initializing auth listener...');
                
                // Listen to Firebase auth state changes
                authListenerUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    console.log('[Auth] State changed:', firebaseUser?.email || 'No user');
                    
                    if (firebaseUser) {
                        try {
                            // Get the ID token
                            const token = await firebaseUser.getIdToken(true); // Force refresh
                            
                            // Set token immediately so axios can use it
                            set({ token });
                            
                            // Sync user with backend using /auth/verify endpoint
                            // This will create the user in Firestore if they don't exist
                            let backendUser = null;
                            const authHeader = { headers: { Authorization: `Bearer ${token}` } };
                            
                            try {
                                // Use auth/verify endpoint which creates user if not exists
                                const response = await axiosInstance.post('/auth/verify', {}, authHeader);
                                backendUser = response.data.user;
                                console.log('[Auth] User synced via /auth/verify:', backendUser?.email);
                            } catch (err) {
                                console.error('[Auth] Failed to sync user with backend:', err);
                                // Still continue - user can use Firebase auth even if backend sync fails
                            }

                            const user = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                name: backendUser?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                                photoURL: backendUser?.photoURL || firebaseUser.photoURL,
                                role: backendUser?.role || DEFAULT_ROLE,
                                ...backendUser,
                            };

                            set({
                                user,
                                token,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                            console.log('[Auth] User authenticated:', user.email, 'Role:', user.role);
                        } catch (error) {
                            console.error('[Auth] Error syncing user:', error);
                            // Still set user from Firebase even if backend sync fails
                            set({
                                user: {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                                    photoURL: firebaseUser.photoURL,
                                    role: DEFAULT_ROLE,
                                },
                                token: await firebaseUser.getIdToken(),
                                isAuthenticated: true,
                                isLoading: false,
                            });
                        }
                    } else {
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isLoading: false,
                        });
                    }
                });

                return authListenerUnsubscribe;
            },

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const token = await userCredential.user.getIdToken();
                    
                    // Fetch user from backend
                    const response = await axiosInstance.get(`/users/${userCredential.user.uid}`);
                    const backendUser = response.data.user;

                    const user = {
                        uid: userCredential.user.uid,
                        email: userCredential.user.email,
                        name: backendUser?.name || userCredential.user.displayName,
                        photoURL: backendUser?.photoURL || userCredential.user.photoURL,
                        role: backendUser?.role || DEFAULT_ROLE,
                        ...backendUser,
                    };

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    const welcomeMsg = user.role === 'admin' ? 'Welcome, Admin!' : 
                                       user.role === 'contributor' ? 'Welcome, Contributor!' : 'Welcome!';
                    toast.success(welcomeMsg);
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    const message = getAuthErrorMessage(error.code);
                    toast.error(message);
                    return { success: false, error: message };
                }
            },

            register: async (email, password, name, role = DEFAULT_ROLE) => {
                set({ isLoading: true });
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    
                    // Update Firebase profile
                    await updateProfile(userCredential.user, { displayName: name });
                    
                    const token = await userCredential.user.getIdToken();
                    
                    // Set token first for axios
                    set({ token });

                    // Sync user with backend via /auth/verify (creates if not exists)
                    let backendUser = null;
                    try {
                        const response = await axiosInstance.post('/auth/verify', {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        backendUser = response.data.user;
                        console.log('[Auth] Registered user synced:', backendUser?.email);
                    } catch (err) {
                        console.error('[Auth] Failed to sync registered user:', err);
                    }

                    const user = {
                        uid: userCredential.user.uid,
                        email,
                        name,
                        role: backendUser?.role || DEFAULT_ROLE,
                        photoURL: backendUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                        ...backendUser,
                    };

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Account created successfully!');
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    const message = getAuthErrorMessage(error.code);
                    toast.error(message);
                    return { success: false, error: message };
                }
            },

            loginWithGoogle: async () => {
                set({ isLoading: true });
                try {
                    const result = await signInWithPopup(auth, googleProvider);
                    const token = await result.user.getIdToken();
                    
                    // Set token first for axios
                    set({ token });

                    // Sync user with backend via /auth/verify (creates if not exists)
                    let backendUser = null;
                    try {
                        const response = await axiosInstance.post('/auth/verify', {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        backendUser = response.data.user;
                        console.log('[Auth] Google user synced:', backendUser?.email);
                    } catch (err) {
                        console.error('[Auth] Failed to sync Google user:', err);
                    }

                    const user = {
                        uid: result.user.uid,
                        email: result.user.email,
                        name: backendUser?.name || result.user.displayName,
                        photoURL: backendUser?.photoURL || result.user.photoURL,
                        role: backendUser?.role || DEFAULT_ROLE,
                        ...backendUser,
                    };

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Welcome!');
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    if (error.code !== 'auth/popup-closed-by-user') {
                        toast.error('Google sign-in failed');
                    }
                    return { success: false, error: error.message };
                }
            },

            loginWithGithub: async () => {
                set({ isLoading: true });
                try {
                    const result = await signInWithPopup(auth, githubProvider);
                    const token = await result.user.getIdToken();
                    
                    // Set token first for axios
                    set({ token });

                    // Sync user with backend via /auth/verify (creates if not exists)
                    let backendUser = null;
                    try {
                        const response = await axiosInstance.post('/auth/verify', {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        backendUser = response.data.user;
                        console.log('[Auth] GitHub user synced:', backendUser?.email);
                    } catch (err) {
                        console.error('[Auth] Failed to sync GitHub user:', err);
                    }

                    const user = {
                        uid: result.user.uid,
                        email: result.user.email,
                        name: backendUser?.name || result.user.displayName,
                        photoURL: backendUser?.photoURL || result.user.photoURL,
                        role: backendUser?.role || DEFAULT_ROLE,
                        ...backendUser,
                    };

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Welcome!');
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false });
                    if (error.code !== 'auth/popup-closed-by-user') {
                        toast.error('GitHub sign-in failed');
                    }
                    return { success: false, error: error.message };
                }
            },

            logout: async (showToast = true) => {
                try {
                    await signOut(auth);
                    set({ user: null, token: null, isAuthenticated: false });
                    if (showToast) {
                        toast.success('Logged out successfully');
                    }
                } catch (error) {
                    console.error('[Auth] Logout error:', error);
                }
            },

            updateUser: async (data) => {
                const { user, token } = get();
                if (!user) return { success: false };

                try {
                    const response = await axiosInstance.put(`/users/${user.uid}`, data);
                    const updatedUser = { ...user, ...response.data.user };
                    set({ user: updatedUser });
                    toast.success('Profile updated successfully');
                    return { success: true };
                } catch (error) {
                    toast.error('Failed to update profile');
                    return { success: false, error: error.message };
                }
            },

            // Helper to check if user can create projects
            canCreateProjects: () => {
                const { user } = get();
                return user && (user.role === 'contributor' || user.role === 'admin');
            },

            // Helper to check if user is admin
            isAdmin: () => {
                const { user } = get();
                return user?.role === 'admin';
            },

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),

            // Refresh token (called by axios interceptor if needed)
            refreshToken: async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const token = await currentUser.getIdToken(true);
                    set({ token });
                    return token;
                }
                return null;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

// Export role constants for use in components
export { VALID_ROLES, DEFAULT_ROLE };

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Operation not allowed',
        'auth/weak-password': 'Password is too weak',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many attempts. Please try again later',
    };
    return errorMessages[errorCode] || 'Authentication failed';
}

console.log('%c[Auth] Firebase Authentication initialized', 'color: #4CAF50; font-weight: bold;');
