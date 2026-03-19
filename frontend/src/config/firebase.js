/**
 * Firebase Configuration - Mock Mode
 *
 * This version provides mock Firebase objects for frontend-only development.
 * No actual Firebase connection is established.
 */

// Mock Firebase Auth
export const auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
        // Immediately call with null user (no authenticated user)
        setTimeout(() => callback(null), 0);
        return () => {}; // Unsubscribe function
    },
};

// Mock Firestore Database
export const db = {
    // Mock db object - actual operations handled by firebaseService.js
};

// Mock Auth Providers
export const googleProvider = { providerId: 'google.com' };
export const githubProvider = { providerId: 'github.com' };

// Mock Firebase App
const mockApp = {
    name: '[MOCK]',
    options: {},
};

export default mockApp;

// Console notification
console.log('%c[MOCK FIREBASE] Firebase is mocked - no real connection established',
    'color: #EF4444; font-weight: bold; font-size: 12px;');
console.log('%c Use mock authentication methods (loginAsDemo, loginAsMockUser) for testing',
    'color: #9CA3AF; font-size: 11px;');
