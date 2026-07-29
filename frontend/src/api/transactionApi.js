import axios from 'axios';

const API_URL = '/api/transactions';

export const transactionApi = {
  getTransactions: async (token) => {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  createTransaction: async (token, transactionData) => {
    const response = await axios.post(API_URL, transactionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  deleteTransaction: async (token, id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
