import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { auth, googleProvider, githubProvider } from '../config/firebase'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'
import { usersAPI } from '../services/api'
import { toast } from 'sonner'

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: true,
            isAuthenticated: false,

            initAuth: () => {
                // If already authenticated via demo mode, don't reset
                const currentState = get();
                if (currentState.isAuthenticated && currentState.user?.isDemoUser) {
                    set({ isLoading: false });
                    return;
                }
                onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        try {
                            const token = await firebaseUser.getIdToken()
                            set({ token })
                            let userData = null
                            try {
                                const response = await usersAPI.getById(firebaseUser.uid)
                                userData = response.data.user
                            } catch {
                                console.log('User not found in backend, using Firebase data')
                            }
                            set({
                                user: {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    name: userData?.name || firebaseUser.displayName || 'User',
                                    photoURL: firebaseUser.photoURL,
                                    role: userData?.role || 'member',
                                    ...userData,
                                },
                                isAuthenticated: true,
                                isLoading: false,
                            })
                        } catch (error) {
                            console.error('Auth error:', error)
                            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
                        }
                    } else {
                        // Only reset if not in demo mode
                        if (!get().user?.isDemoUser) {
                            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
                        } else {
                            set({ isLoading: false });
                        }
                    }
                })
            },

            login: async (email, password) => {
                set({ isLoading: true })
                try {
                    await signInWithEmailAndPassword(auth, email, password)
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
                    await signOut(auth)
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
                    const response = await usersAPI.update(user.uid, data)
                    set({ user: { ...user, ...response.data.user } })
                    toast.success('Profile updated successfully')
                    return { success: true }
                } catch {
                    toast.error('Failed to update profile')
                    return { success: false }
                }
            },

            refreshToken: async () => {
                if (auth.currentUser) {
                    const token = await auth.currentUser.getIdToken(true)
                    set({ token })
                    return token
                }
                return null
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
            partialize: (state) => ({ token: state.token }),
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
