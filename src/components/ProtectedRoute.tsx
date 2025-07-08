import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-valore-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-valore-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login with the current location
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;