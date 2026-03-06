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
import { usersAPI } from '../api/users.api'
import { toast } from 'sonner'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      // Initialize auth listener
      initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const token = await firebaseUser.getIdToken()
              // Setting token immediately to ensure api interceptors have it
              set({ token })

              // Try to get user data from backend
              let userData = null
              try {
                const response = await usersAPI.getById(firebaseUser.uid)
                userData = response.data.user
              } catch (error) {
                // User might not exist in backend yet
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
            set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          }
        })
      },

      // Email/Password Login
      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const result = await signInWithEmailAndPassword(auth, email, password)
          const token = await result.user.getIdToken()
          toast.success('Welcome back!')
          return { success: true }
        } catch (error) {
          console.error('Login error:', error)
          const message = getAuthErrorMessage(error.code)
          toast.error(message)
          set({ isLoading: false })
          return { success: false, error: message }
        }
      },

      // Email/Password Register
      register: async (email, password, name) => {
        set({ isLoading: true })
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password)

          // Update display name
          await updateProfile(result.user, { displayName: name })

          toast.success('Account created successfully!')
          return { success: true }
        } catch (error) {
          console.error('Register error:', error)
          const message = getAuthErrorMessage(error.code)
          toast.error(message)
          set({ isLoading: false })
          return { success: false, error: message }
        }
      },

      // Google Sign In
      loginWithGoogle: async () => {
        set({ isLoading: true })
        try {
          await signInWithPopup(auth, googleProvider)
          toast.success('Welcome!')
          return { success: true }
        } catch (error) {
          console.error('Google login error:', error)
          const message = getAuthErrorMessage(error.code)
          toast.error(message)
          set({ isLoading: false })
          return { success: false, error: message }
        }
      },

      // GitHub Sign In
      loginWithGithub: async () => {
        set({ isLoading: true })
        try {
          await signInWithPopup(auth, githubProvider)
          toast.success('Welcome!')
          return { success: true }
        } catch (error) {
          console.error('GitHub login error:', error)
          const message = getAuthErrorMessage(error.code)
          toast.error(message)
          set({ isLoading: false })
          return { success: false, error: message }
        }
      },

      // Logout
      logout: async () => {
        try {
          await signOut(auth)
          set({ user: null, token: null, isAuthenticated: false })
          toast.success('Logged out successfully')
        } catch (error) {
          console.error('Logout error:', error)
          toast.error('Failed to logout')
        }
      },

      // Update user profile
      updateUser: async (data) => {
        const { user } = get()
        if (!user) return

        try {
          const response = await usersAPI.update(user.uid, data)
          set({ user: { ...user, ...response.data.user } })
          toast.success('Profile updated successfully')
          return { success: true }
        } catch (error) {
          console.error('Update user error:', error)
          toast.error('Failed to update profile')
          return { success: false }
        }
      },

      // Refresh token
      refreshToken: async () => {
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken(true)
          set({ token })
          return token
        }
        return null
      },

      // Expose state setters for manual updates
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

// Helper function to get user-friendly error messages
function getAuthErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered'
    case 'auth/invalid-email':
      return 'Invalid email address'
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/invalid-credential':
      return 'Invalid email or password'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed'
    default:
      return 'An error occurred. Please try again'
  }
}

// Initialize auth listener manually in a client-side layout or provider
// useAuthStore.getState().initAuth()
