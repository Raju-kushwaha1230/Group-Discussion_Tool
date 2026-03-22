import { create } from 'zustand';
import api from '../utils/api';

const useRoomStore = create((set, get) => ({
  rooms: [],
  activeRoom: null,
  activeRoomData: null,
  isLoading: false,
  error: null,
  searchResults: {
    rooms: [],
    users: [],
    workspaces: []
  },

  // Actions
  fetchRooms: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/rooms');
      set({ rooms: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch rooms', isLoading: false });
    }
  },

  createRoom: async (roomData) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/rooms', roomData);
      set(state => ({ 
        rooms: [...state.rooms, res.data.data],
        isLoading: false 
      }));
      return res.data.data;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to create room', isLoading: false });
      return null;
    }
  },

  setActiveRoom: async (roomId) => {
    if (!roomId) {
      set({ activeRoom: null, activeRoomData: null });
      return;
    }
    
    set({ activeRoom: roomId, isLoading: true });
    try {
      const res = await api.get(`/rooms/${roomId}`);
      set({ activeRoomData: res.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Failed to fetch room details', isLoading: false });
    }
  },

  searchAll: async (query) => {
    if (!query) {
      set({ searchResults: { rooms: [], users: [] } });
      return;
    }

    set({ isLoading: true });
    try {
       const [roomRes, userRes, workspaceRes] = await Promise.all([
         api.get(`/rooms/search?q=${query}`),
         api.get(`/users/search?q=${query}`),
         api.get(`/workspaces/search?q=${query}`)
       ]);
       
       set({ 
         searchResults: { 
           rooms: roomRes.data.data, 
           users: userRes.data.data,
           workspaces: workspaceRes.data.data
         }, 
         isLoading: false 
       });
    } catch (err) {
      set({ isLoading: false });
    }
  }
}));

export default useRoomStore;
