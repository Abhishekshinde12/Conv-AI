import { Outlet, Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const ProtectedRoutes = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isAuthLoading = useAuthStore((state) => state.isAuthLoading);

    // If still checking authentication, don't redirect yet
    if (isAuthLoading) {
        return null; // Or a loading spinner, your choice. App.jsx handles the global loading.
    }

    return isAuthenticated ? <Outlet /> : <Navigate to='/login' />;
}

export default ProtectedRoutes;