/**
 * ORBIS Auth — Protected Route Component
 * Redirects unauthenticated users to /auth/login.
 * Optionally restricts by role.
 */

import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Optional: restrict to specific roles */
  allowedRoles?: ('official' | 'trainer' | 'admin')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const stored = localStorage.getItem('orbis_user');
  const token = localStorage.getItem('orbis_access_token');

  if (!stored || !token) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(stored);
      if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
      }
    } catch {
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
}
