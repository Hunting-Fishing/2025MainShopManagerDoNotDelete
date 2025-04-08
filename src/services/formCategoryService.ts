
import { FormCategory } from '@/types/form';
import { supabase } from '@/integrations/supabase/client';

export async function getFormCategories(): Promise<FormCategory[]> {
  try {
    // Use the proper client with proper typing
    const { data, error } = await supabase
      .from('form_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return (data || []) as FormCategory[];
  } catch (error) {
    console.error('Error fetching form categories:', error);
    return [];
  }
}

export async function createFormCategory(category: Partial<FormCategory>): Promise<FormCategory | null> {
  try {
    const { data, error } = await supabase
      .from('form_categories')
      .insert({
        name: category.name,
        description: category.description
      })
      .select();
    
    if (error) throw error;
    
    return data && data[0] ? data[0] as FormCategory : null;
  } catch (error) {
    console.error('Error creating form category:', error);
    return null;
  }
}

export async function updateFormCategory(id: string, updates: Partial<FormCategory>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('form_categories')
      .update({
        name: updates.name,
        description: updates.description
      })
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating form category:', error);
    return false;
  }
}

export async function deleteFormCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('form_categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting form category:', error);
    return false;
  }
}
