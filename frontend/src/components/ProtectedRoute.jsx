import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const userStr = localStorage.getItem('currentUser');
  
  if (!userStr) {
    // Not logged in, redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // If route has specific allowed roles and user's role is not in it
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Role not authorized, redirect to their default home
      // For Admin (staff), send them to repairs or intake
      return <Navigate to="/repairs" replace />;
    }
    
    return children;
  } catch (error) {
    // Corrupt local storage
    localStorage.removeItem('currentUser');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
