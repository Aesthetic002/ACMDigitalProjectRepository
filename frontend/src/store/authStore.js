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
import { usersAPI } from '../services/api'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true,
            isAuthenticated: false,

            initAuth: () => {
                // If already authenticated (from persisted state), resolve immediately — no need to hit Firebase
                const currentState = get();
                if (currentState.isAuthenticated && currentState.user) {
                    set({ isLoading: false });
                    // Keep going to attach onAuthStateChanged listener to sync real auth state
                }

                // Safety net: if Firebase doesn't respond in 2s (e.g. no .env config), unblock the app
                const failsafeTimer = setTimeout(() => {
                    if (get().isLoading) {
                        console.warn('Firebase auth timeout — no config or offline. Proceeding as guest.');
                        set({ isLoading: false });
                    }
                }, 2000);

                try {
                    onAuthStateChanged(auth, async (firebaseUser) => {
                        clearTimeout(failsafeTimer);
                        if (firebaseUser) {
                            try {
                                const token = await firebaseUser.getIdToken()
                                set({ token })

                                let role = 'member';
                                let userData = {};
                                
                                // Try API first
                                try {
                                    const response = await usersAPI.getById(firebaseUser.uid);
                                    userData = response.data.user || {};
                                    role = userData.role || 'member';
                                } catch {
                                    // Fallback to Firestore directly
                                    try {
                                        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
                                        if (userSnap.exists()) {
                                            userData = userSnap.data();
                                            role = userData.role || 'member';
                                        }
                                    } catch { /* Firestore offline — keep default role */ }
                                }

                                set({
                                    user: {
                                        uid: firebaseUser.uid,
                                        email: firebaseUser.email,
                                        name: userData.name || firebaseUser.displayName || 'User',
                                        photoURL: firebaseUser.photoURL,
                                        role,
                                        ...userData,
                                    },
                                    isAuthenticated: true,
                                    isLoading: false,
                                });
                            } catch (error) {
                                console.error('Auth error:', error);
                                set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                            }
                        } else {
                            // Only reset if not in demo mode
                            if (!get().user?.isDemoUser) {
                                set({ user: null, token: null, isAuthenticated: false, isLoading: false })
                            } else {
                                set({ isLoading: false });
                            }
                        }
                    });
                } catch (err) {
                    // Firebase completely unavailable (bad/missing config)
                    clearTimeout(failsafeTimer);
                    console.error('Firebase init failed:', err.message);
                    set({ isLoading: false });
                }
            },

            login: async (email, password, role = 'member') => {
                set({ isLoading: true })
                try {
                    const result = await signInWithEmailAndPassword(auth, email, password)
                    const token = await result.user.getIdToken()

                    // Immediately update state for a faster UI response
                    set((state) => ({
                        user: {
                            uid: result.user.uid,
                            email: result.user.email,
                            name: result.user.displayName || email.split('@')[0],
                            photoURL: result.user.photoURL,
                            role: role, // Use the role passed to the login function
                        },
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    }));

                    toast.success(role === 'admin' ? 'Welcome, Admin!' : 'Welcome back!');
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
                    const result = await signInWithPopup(auth, googleProvider)
                    const token = await result.user.getIdToken()
                    
                    let role = 'member';
                    let userData = {};
                    try {
                        const userSnap = await getDoc(doc(db, 'users', result.user.uid));
                        if (userSnap.exists()) {
                            userData = userSnap.data();
                            role = userData.role || 'member';
                        } else {
                            userData = {
                                uid: result.user.uid,
                                email: result.user.email,
                                name: result.user.displayName || result.user.email.split('@')[0],
                                photoURL: result.user.photoURL,
                                role: 'member',
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp(),
                            };
                            await setDoc(doc(db, 'users', result.user.uid), userData);
                        }
                    } catch (e) {
                        console.error("Error setting up OAuth user:", e);
                    }

                    set({
                        user: {
                            uid: result.user.uid,
                            email: result.user.email,
                            name: userData.name || result.user.displayName,
                            photoURL: result.user.photoURL,
                            role,
                            ...userData,
                        },
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

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
                    const result = await signInWithPopup(auth, githubProvider)
                    const token = await result.user.getIdToken()
                    
                    let role = 'member';
                    let userData = {};
                    try {
                        const userSnap = await getDoc(doc(db, 'users', result.user.uid));
                        if (userSnap.exists()) {
                            userData = userSnap.data();
                            role = userData.role || 'member';
                        } else {
                            userData = {
                                uid: result.user.uid,
                                email: result.user.email || `${result.user.uid}@github.local`,
                                name: result.user.displayName || 'GitHub User',
                                photoURL: result.user.photoURL,
                                role: 'member',
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp(),
                            };
                            await setDoc(doc(db, 'users', result.user.uid), userData);
                        }
                    } catch (e) {
                         console.error("Error setting up OAuth user:", e);
                    }

                    set({
                        user: {
                            uid: result.user.uid,
                            email: result.user.email,
                            name: userData.name || result.user.displayName,
                            photoURL: result.user.photoURL,
                            role,
                            ...userData,
                        },
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success('Welcome!')
                    return { success: true }
                } catch (error) {
                    const message = getAuthErrorMessage(error.code)
                    toast.error(message)
                    set({ isLoading: false })
                    return { success: false, error: message }
                }
            },

            logout: async (showToast = true) => {
                try {
                    // Only call Firebase signOut for real accounts
                    const { user } = get();
                    if (!user?.isDemoUser) {
                        await signOut(auth)
                    }
                    set({ user: null, token: null, isAuthenticated: false })
                    if (showToast) {
                        toast.success('Logged out successfully')
                    }
                } catch {
                    if (showToast) {
                        toast.error('Failed to logout')
                    }
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
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
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
