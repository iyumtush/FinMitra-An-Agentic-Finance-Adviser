import axios from 'axios';

const API_URL = '/api/budgets';

export const budgetApi = {
  getBudgets: async (token) => {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  setBudget: async (token, budgetData) => {
    const response = await axios.post(API_URL, budgetData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
