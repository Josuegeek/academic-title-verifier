import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { DiplomaManagement } from './pages/DiplomaManagement';
import { DiplomaVerification } from './pages/DiplomaVerification';
import { UniversityManagement } from './pages/UniversityManagement';
import { UserManagement } from './pages/UserManagement';
import { FacultyManagement } from './pages/FacultyManagement';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { PromotionManagement } from './pages/PromotionManagement';
import { StudentManagement } from './pages/StudentManagement';

// Components
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Types
import { Profile } from './types';
import { ToastContainer } from 'react-toastify';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-8 w-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer/>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" replace />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute user={user} profile={profile} />}>
          {profile && <Route element={<Layout profile={profile} />}>
            <Route path="/dashboard" element={<Dashboard profile={profile} />} />
            <Route path="/verify" element={<DiplomaVerification />} />
            
            {/* Admin only routes */}
            {profile?.role === 'admin' && (
              <>
                <Route path="/universities" element={<UniversityManagement />} />
                <Route path="/users" element={<UserManagement />} />
              </>
            )}
            
            {/* University staff routes */}
            {(profile?.role === 'admin' || profile?.role === 'university_staff') && (
              <>
                <Route path="/diplomas" element={<DiplomaManagement profile={profile} />} />
                <Route path="/faculties" element={<FacultyManagement />} />
                <Route path="/departments" element={<DepartmentManagement />} />
                <Route path="/promotions" element={<PromotionManagement />} />
                <Route path="/students" element={<StudentManagement />} />
              </>
            )}
          </Route>}
        </Route>
        <Route path='/*' element={<Navigate to='/' />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;