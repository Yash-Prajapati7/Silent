import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service methods
export const apiService = {
  // Get random usernames
  getRandomNames: async (count = 10) => {
    try {
      const response = await api.get(`/names?count=${count}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch random names');
    }
  },

  // Create a new room
  createRoom: async (creator, password = null, creatorPassword = null) => {
    try {
      const response = await api.post('/create-room', { creator, password, creatorPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create room');
    }
  },

  // Join an existing room
  joinRoom: async (roomId, userName, password = null, creatorPassword = null) => {
    try {
      const response = await api.post('/join-room', { roomId, userName, password, creatorPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to join room');
    }
  },

  // Leave a room
  leaveRoom: async (roomId, userName) => {
    try {
      const response = await api.post('/leave-room', { roomId, userName });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to leave room');
    }
  },

  // End a room (creator only)
  endRoom: async (roomId, userName) => {
    try {
      const response = await api.post('/end-room', { 
        roomId, 
        userName,
        isCreator: true 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Name': userName,
          'X-Room-Id': roomId
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to end room');
    }
  },

  // Get room information
  getRoomInfo: async (roomId) => {
    try {
      const response = await api.get(`/room/${roomId}/info`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get room info');
    }
  },

  // Get chat history
  getChatHistory: async (roomId, limit = 50, skip = 0) => {
    try {
      const response = await api.get(`/room/${roomId}/history?limit=${limit}&skip=${skip}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get chat history');
    }
  },

  // Check if room requires password
  checkRoomPassword: async (roomId) => {
    try {
      const response = await api.get(`/room/${roomId}/password-check`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to check room password requirement');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const healthURL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      const response = await axios.get(`${healthURL}/health`);
      return response.data;
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  }
};

export default apiService;
