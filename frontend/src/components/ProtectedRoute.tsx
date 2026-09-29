import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  // Check for the new competency profile logic first
  const profileStr = localStorage.getItem('user_profile');
  
  if (profileStr) {
    try {
      const profile = JSON.parse(profileStr);
      if (allowedRoles && !allowedRoles.includes(profile.role)) {
        return <Navigate to="/unauthorized" replace />;
      }
      return children;
    } catch (e) {
      console.error('Failed to parse user profile', e);
    }
  }

  // Fallback for legacy tutor flow logic (e.g. 'teacher' paths vs 'student' paths)
  const isTeacherPath = location.pathname.startsWith('/teacher');
  
  if (isTeacherPath) {
    if (!localStorage.getItem('teacher_token')) {
      return <Navigate to="/teacher/" replace />;
    }
    return children;
  }
  
  // Legacy Student
  if (!localStorage.getItem('currentStudent')) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}
