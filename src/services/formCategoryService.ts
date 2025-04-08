
import { supabase } from '@/lib/supabase';
import { FormCategory } from '@/types/form';
import { PostgrestError } from '@supabase/supabase-js';

export async function getFormCategories(): Promise<FormCategory[]> {
  try {
    // Use any type to bypass TypeScript's type checking
    const { data, error } = await (supabase
      .from('form_categories') as any)
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
    // Use any type to bypass TypeScript's type checking
    const { data, error } = await (supabase
      .from('form_categories') as any)
      .insert({
        name: category.name,
        description: category.description
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data as FormCategory;
  } catch (error) {
    console.error('Error creating form category:', error);
    return null;
  }
}

export async function updateFormCategory(id: string, updates: Partial<FormCategory>): Promise<boolean> {
  try {
    // Use any type to bypass TypeScript's type checking
    const { error } = await (supabase
      .from('form_categories') as any)
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
    // Use any type to bypass TypeScript's type checking
    const { error } = await (supabase
      .from('form_categories') as any)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting form category:', error);
    return false;
  }
}
