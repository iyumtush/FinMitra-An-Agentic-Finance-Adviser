import api from './authApi';

export const budgetApi = {
  getBudgets: async () => {
    const response = await api.get('/budgets');
    return response.data;
  },

  setBudget: async (budgetData) => {
    const response = await api.post('/budgets', budgetData);
    return response.data;
  }
};
