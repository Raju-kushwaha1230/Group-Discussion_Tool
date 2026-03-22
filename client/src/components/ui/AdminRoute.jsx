import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminRoute = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return null;

  return user && (user.role === 'admin' || user.role === 'super-admin') ? <Outlet /> : <Navigate to="/home" />;
};

export default AdminRoute;
