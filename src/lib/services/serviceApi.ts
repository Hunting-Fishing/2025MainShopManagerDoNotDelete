
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface ServiceCategoryUpdate {
  name?: string;
  description?: string;
}

export const updateServiceCategory = async (
  categoryId: string, 
  updates: ServiceCategoryUpdate
): Promise<ServiceMainCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating service category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update service category:', error);
    throw error;
  }
};

export const createServiceCategory = async (
  category: Omit<ServiceMainCategory, 'id' | 'subcategories'>
): Promise<ServiceMainCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: category.name,
        description: category.description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service category:', error);
      throw error;
    }

    return {
      ...data,
      subcategories: []
    };
  } catch (error) {
    console.error('Failed to create service category:', error);
    throw error;
  }
};

export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting service category:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete service category:', error);
    throw error;
  }
};
