import { supabase } from '../supabaseClient';

export const transactionApi = {
  getTransactions: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  createTransaction: async (transactionData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        amount: transactionData.amount,
        category: transactionData.category,
        note: transactionData.note || '',
        type: transactionData.type,
        date: transactionData.date || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateTransaction: async (id, transactionData) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({
        amount: transactionData.amount,
        category: transactionData.category,
        note: transactionData.note,
        type: transactionData.type,
        date: transactionData.date
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};
