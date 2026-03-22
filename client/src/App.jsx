import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Onboarding from './features/onboarding/Onboarding';
import BecomeAdmin from './features/auth/BecomeAdmin';
import ChatLayout from './features/chat/ChatLayout';
import MainLayout from './components/layout/MainLayout';
import Home from './features/home/Home';
import Search from './features/search/Search';
import Notification from './features/notifications/Notification';
import Profile from './features/profile/Profile';
import AdminDashboard from './features/admin/AdminDashboard';
import AdminRoute from './components/ui/AdminRoute';

function App() {
  const loadUser = useAuthStore(state => state.loadUser);
  const isLoading = useAuthStore(state => state.isLoading);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const isSuperAdmin = !isLoading && user?.role === 'super-admin';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-pink"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-brand-pink rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route element={<MainLayout />}>
            <Route path="/home" element={isSuperAdmin ? <Navigate to="/admin" replace /> : <Home />} />
            <Route path="/search" element={isSuperAdmin ? <Navigate to="/admin" replace /> : <Search />} />
            <Route path="/notifications" element={isSuperAdmin ? <Navigate to="/admin" replace /> : <Notification />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/become-admin" element={<BecomeAdmin />} />
            <Route path="/" element={isSuperAdmin ? <Navigate to="/admin" replace /> : <ChatLayout />} />
            <Route path="/room/:roomId" element={<ChatLayout />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
