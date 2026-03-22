import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, message: 'Welcome back! Login successful.' };
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      set({
        error: message,
        isLoading: false,
      });
      return { success: false, message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, message: 'Account created successfully!' };
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      set({
        error: message,
        isLoading: false,
      });
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.put('/users/profile', profileData);
      set({
        user: res.data.data,
        isLoading: false,
      });
      return { success: true, message: 'Profile updated successfully!' };
    } catch (err) {
      const message = err.response?.data?.error || 'Profile update failed';
      set({
        error: message,
        isLoading: false,
      });
      return { success: false, message };
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get('/auth/me');
        set({
           user: res.data.data,
           token: token,
           isAuthenticated: true,
           isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  requestAdminRole: async (details) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/users/request-admin', { details });
      set({
        user: { ...useAuthStore.getState().user, adminRequestStatus: 'pending' },
        isLoading: false
      });
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.error || 'Request failed';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  fetchAdminRequests: async () => {
    try {
      const res = await api.get('/users/admin-requests');
      return res.data.data;
    } catch (err) {
      return [];
    }
  },

  manageAdminRequest: async (userId, status) => {
    try {
      const res = await api.put(`/users/admin-requests/${userId}`, { status });
      return { success: true, message: res.data.message };
    } catch (err) {
      const message = err.response?.data?.error || 'Update failed';
      return { success: false, message };
    }
  },
}));

export default useAuthStore;
