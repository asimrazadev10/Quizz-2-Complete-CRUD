import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { userAPI } from "../utils/api";

const AdminProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        return;
      }

      setIsAuthenticated(true);

      try {
        const response = await userAPI.getMe();
        if (response.data.role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    // Check auth immediately
    checkAuth();

    // Listen for auth changes
    const onAuthChanged = () => checkAuth();
    window.addEventListener("authChanged", onAuthChanged);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
    };
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null || isAdmin === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render children if authenticated and admin
  return children;
};

export default AdminProtectedRoute;

