import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/hooks/useTheme';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

import HomePage from '@/pages/HomePage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import SearchPage from '@/pages/SearchPage';
import CreateProjectPage from '@/pages/CreateProjectPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CreateEventPage from '@/pages/CreateEventPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: 1000 * 60 * 5, retry: 1 },
    },
});

function AuthInitializer({ children }) {
    const initAuth = useAuthStore((s) => s.initAuth);
    useEffect(() => { initAuth(); }, [initAuth]);
    return children;
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthInitializer>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/projects" element={<ProjectsPage />} />
                            <Route path="/projects/:id" element={<ProjectDetailPage />} />
                            <Route path="/search" element={<SearchPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/submit" element={
                                <ProtectedRoute><CreateProjectPage /></ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute><ProfilePage /></ProtectedRoute>
                            } />
                            <Route path="/admin" element={
                                <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
                            } />
                            <Route path="/admin/events/new" element={
                                <ProtectedRoute adminOnly><CreateEventPage /></ProtectedRoute>
                            } />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                    <Toaster position="top-right" richColors />
                </AuthInitializer>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
