import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '../types';

interface ProtectedRouteProps {
  user: User | null;
  profile: Profile | null;
}

export function ProtectedRoute({ user, profile }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  return <Outlet />;
}