import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const RoleBasedRouting = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    // If user not found (not logged in), send to login
    return <Navigate to="/login" replace />;
  }

  // Extract user type
  const userType = user.user_type;

  // Role-based access control logic
  if (location.pathname.startsWith("/customer") && userType !== "customer") {
    return <Navigate to="/representative" replace />;
  }

  if (location.pathname.startsWith("/representative") && userType !== "representative") {
    return <Navigate to="/customer" replace />;
  }

  // ✅ If authorized, render nested routes
  return <Outlet />;
};

export default RoleBasedRouting;
