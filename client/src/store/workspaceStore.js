import { create } from 'zustand';
import api from '../utils/api';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    try {
      const res = await api.get('/workspaces');
      set({ workspaces: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch workspaces', isLoading: false });
    }
  },

  createWorkspace: async (workspaceData) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/workspaces', workspaceData);
      set({ isLoading: false });
      return { success: true, data: res.data.data };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.error || 'Failed to request workspace' };
    }
  },

  updateStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      const res = await api.put(`/workspaces/${id}/status`, { status });
      set(state => ({
        workspaces: state.workspaces.map(ws => ws._id === id ? res.data.data : ws),
        isLoading: false
      }));
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to update status', isLoading: false });
      return false;
    }
  },

  joinWorkspace: async (id) => {
    set({ isLoading: true });
    try {
      await api.post(`/workspaces/${id}/join`);
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.error || 'Failed to join workspace' };
    }
  },

  manageMemberRequest: async (workspaceId, userId, status) => {
    set({ isLoading: true });
    try {
      await api.put(`/workspaces/${workspaceId}/members/${userId}`, { status });
      set({ isLoading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to manage member', isLoading: false });
      return false;
    }
  },

  searchWorkspaces: async (query) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/workspaces/search?q=${query}`);
      set({ isLoading: false });
      return { success: true, data: res.data.data };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.error || 'Search failed' };
    }
  }
}));

export default useWorkspaceStore;
