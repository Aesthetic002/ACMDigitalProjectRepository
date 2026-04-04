import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Loader from "./common/Loader";

/**
 * ProtectedRoute - Guards routes based on authentication and role
 * 
 * Props:
 * - adminOnly: Only admins can access
 * - contributorOnly: Only contributors and admins can access (for project creation)
 */
export default function ProtectedRoute({ children, adminOnly = false, contributorOnly = false }) {
    const { isAuthenticated, isLoading, user, canCreateProjects } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#090E1A]">
                <Loader />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={`/login?from=${encodeURIComponent(location.pathname)}`} replace />;
    }

    // Admin-only routes
    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Contributor-only routes (contributors and admins can access)
    if (contributorOnly && !canCreateProjects()) {
        return <Navigate to="/" replace />;
    }

    return children;
}
