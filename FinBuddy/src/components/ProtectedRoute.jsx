import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // while auth state is being determined, show a simple loader (customize as you like)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Checking authentication…</div>
      </div>
    );
  }

  // if not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // authorized
  return children;
}
