import api from './authApi';

export const aiApi = {
  getInsights: async () => {
    const response = await api.get('/ai/insights');
    return response.data;
  },

  sendMessage: async (message) => {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  }
};
