/**
 * Auth Store - Mock Data Mode
 *
 * This version provides mock authentication for frontend-only development.
 * No Firebase connection required.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { mockUsers } from '@/data/mockData'

// Mock user database (in-memory)
let registeredUsers = [...mockUsers];

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,

            initAuth: () => {
                // Check if already authenticated from persisted state
                const currentState = get();
                if (currentState.isAuthenticated && currentState.user) {
                    console.log('[Mock Auth] Restored session for:', currentState.user.email);
                    set({ isLoading: false });
                    return;
                }
                set({ isLoading: false });
            },

            login: async (email, password, role = 'member') => {
                set({ isLoading: true });

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Find user in mock database
                const existingUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (existingUser) {
                    const token = `mock-token-${Date.now()}`;
                    set({
                        user: {
                            ...existingUser,
                            role: existingUser.role || role,
                        },
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    toast.success(existingUser.role === 'admin' ? 'Welcome, Admin!' : 'Welcome back!');
                    console.log('[Mock Auth] Login successful:', email);
                    return { success: true };
                }

                // Auto-create user if not found (for demo purposes)
                const newUser = {
                    uid: `user-${Date.now()}`,
                    email,
                    name: email.split('@')[0],
                    role,
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                    createdAt: { _seconds: Math.floor(Date.now() / 1000) },
                };
                registeredUsers.push(newUser);

                const token = `mock-token-${Date.now()}`;
                set({
                    user: newUser,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });

                toast.success('Welcome! Account created automatically.');
                console.log('[Mock Auth] New user created and logged in:', email);
                return { success: true };
            },

            register: async (email, password, name, role = 'member') => {
                set({ isLoading: true });

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500));

                // Check if user already exists
                if (registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                    set({ isLoading: false });
                    toast.error('This email is already registered');
                    return { success: false, error: 'Email already in use' };
                }

                // Create new user
                const newUser = {
                    uid: `user-${Date.now()}`,
                    email,
                    name,
                    role,
                    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                    createdAt: { _seconds: Math.floor(Date.now() / 1000) },
                    updatedAt: { _seconds: Math.floor(Date.now() / 1000) },
                };
                registeredUsers.push(newUser);

                const token = `mock-token-${Date.now()}`;
                set({
                    user: newUser,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });

                toast.success('Account created successfully!');
                console.log('[Mock Auth] Registration successful:', email);
                return { success: true };
            },

            loginWithGoogle: async () => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 500));

                // Create mock Google user
                const mockGoogleUser = {
                    uid: `google-${Date.now()}`,
                    email: 'demo.google@gmail.com',
                    name: 'Google Demo User',
                    role: 'member',
                    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleUser',
                    provider: 'google',
                    createdAt: { _seconds: Math.floor(Date.now() / 1000) },
                };

                const token = `mock-google-token-${Date.now()}`;
                set({
                    user: mockGoogleUser,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });

                toast.success('Welcome! (Mock Google login)');
                console.log('[Mock Auth] Google login simulated');
                return { success: true };
            },

            loginWithGithub: async () => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 500));

                // Create mock GitHub user
                const mockGithubUser = {
                    uid: `github-${Date.now()}`,
                    email: 'demo.github@github.com',
                    name: 'GitHub Demo User',
                    role: 'member',
                    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GithubUser',
                    provider: 'github',
                    createdAt: { _seconds: Math.floor(Date.now() / 1000) },
                };

                const token = `mock-github-token-${Date.now()}`;
                set({
                    user: mockGithubUser,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });

                toast.success('Welcome! (Mock GitHub login)');
                console.log('[Mock Auth] GitHub login simulated');
                return { success: true };
            },

            logout: async (showToast = true) => {
                set({ user: null, token: null, isAuthenticated: false });
                if (showToast) {
                    toast.success('Logged out successfully');
                }
                console.log('[Mock Auth] User logged out');
            },

            updateUser: async (data) => {
                const { user } = get();
                if (!user) return { success: false };

                await new Promise(resolve => setTimeout(resolve, 300));

                const updatedUser = { ...user, ...data };
                set({ user: updatedUser });

                // Update in mock database
                const index = registeredUsers.findIndex(u => u.uid === user.uid);
                if (index !== -1) {
                    registeredUsers[index] = updatedUser;
                }

                toast.success('Profile updated successfully');
                console.log('[Mock Auth] User profile updated');
                return { success: true };
            },

            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),

            // Demo/Quick login methods
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
                console.log('[Mock Auth] Demo login:', role);
            },

            // Quick login as existing mock user
            loginAsMockUser: (userIndex = 0) => {
                const user = mockUsers[userIndex];
                if (user) {
                    set({
                        user,
                        token: `mock-token-${user.uid}`,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    toast.success(`Logged in as ${user.name}`);
                    console.log('[Mock Auth] Quick login as:', user.name);
                }
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

// Console notification
console.log('%c[MOCK AUTH] Running in mock authentication mode - no Firebase required',
    'color: #F59E0B; font-weight: bold; font-size: 12px;');
