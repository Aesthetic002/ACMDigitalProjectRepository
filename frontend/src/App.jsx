import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

import HomePage from '@/pages/HomePage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import SearchPage from '@/pages/SearchPage';
import CreateProjectPage from '@/pages/CreateProjectPage';
import ProfilePage from '@/pages/ProfilePage';
import EditProjectPage from '@/pages/EditProjectPage';
import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import CreateEventPage from '@/pages/CreateEventPage';
import MembersPage from '@/pages/MembersPage';
import DomainsPage from '@/pages/DomainsPage';
import AdminModerationPage from '@/pages/AdminModerationPage';
import AdminPreAddPage from '@/pages/AdminPreAddPage';
import AdminMembersPage from '@/pages/AdminMembersPage';
import AdminMemberProfilePage from '@/pages/AdminMemberProfilePage';
import MemberProfilePage from '@/pages/MemberProfilePage';
import AdminProjectsPage from '@/pages/AdminProjectsPage';
import AdminProjectDetailPage from '@/pages/AdminProjectDetailPage';
import AdminDomainsPage from '@/pages/AdminDomainsPage';
import AdminLayout from '@/components/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import BigBangAnimation from '@/components/BigBangAnimation';

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

function RootApp() {
    const [animationComplete, setAnimationComplete] = useState(false);

    return (
        <>
            {!animationComplete && (
                <BigBangAnimation onComplete={() => setAnimationComplete(true)} />
            )}
            <div style={{ opacity: animationComplete ? 1 : 0, transition: 'opacity 0.5s ease-in' }}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/projects" element={
                            <ProtectedRoute><ProjectsPage /></ProtectedRoute>
                        } />
                        <Route path="/projects/:id" element={
                            <ProtectedRoute><ProjectDetailPage /></ProtectedRoute>
                        } />
                        <Route path="/projects/:id/edit" element={
                            <ProtectedRoute><EditProjectPage /></ProtectedRoute>
                        } />
                        <Route path="/members" element={
                            <ProtectedRoute><MembersPage /></ProtectedRoute>
                        } />
                        <Route path="/members/:uid" element={
                            <ProtectedRoute><MemberProfilePage /></ProtectedRoute>
                        } />
                        <Route path="/domains" element={
                            <ProtectedRoute><DomainsPage /></ProtectedRoute>
                        } />
                        <Route path="/search" element={
                            <ProtectedRoute><SearchPage /></ProtectedRoute>
                        } />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/submit" element={
                            <ProtectedRoute contributorOnly><CreateProjectPage /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><ProfilePage /></ProtectedRoute>
                        } />
                        {/* Admin Protected Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<AdminPage />} />
                            <Route path="members" element={<AdminMembersPage />} />
                            <Route path="members/:uid" element={<AdminMemberProfilePage />} />
                            <Route path="projects" element={<AdminProjectsPage />} />
                            <Route path="projects/:id" element={<AdminProjectDetailPage />} />
                            <Route path="moderation" element={<AdminModerationPage />} />
                            <Route path="pre-add" element={<AdminPreAddPage />} />
                            <Route path="events/new" element={<CreateEventPage />} />
                            <Route path="domains" element={<AdminDomainsPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <AuthInitializer>
                    <RootApp />
                </AuthInitializer>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
