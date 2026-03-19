import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import Loader from "./common/Loader";

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { isAuthenticated, isLoading, user } = useAuthStore();
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

    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
}
