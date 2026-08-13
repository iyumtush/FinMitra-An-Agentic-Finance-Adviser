import { supabase } from '../supabaseClient';

export const budgetApi = {
  getBudgets: async () => {
    const { data, error } = await supabase
      .from('budgets')
      .select('*');

    if (error) throw error;
    return (data || []).map(b => ({
      ...b,
      limitAmount: b.limit_amount
    }));
  },

  setBudget: async (budgetData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('budgets')
      .upsert([
        {
          user_id: user.id,
          category: budgetData.category,
          limit_amount: budgetData.limitAmount
        }
      ], { onConflict: 'user_id, category' })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      limitAmount: data.limit_amount
    };
  }
};
