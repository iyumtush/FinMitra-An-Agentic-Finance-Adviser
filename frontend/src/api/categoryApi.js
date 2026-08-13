import { supabase } from '../supabaseClient';

export const categoryApi = {
  getCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) throw error;
    return data || [];
  },

  createCategory: async (categoryData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          user_id: user.id,
          name: categoryData.name,
          color: categoryData.color || '#6366f1'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteCategory: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};
