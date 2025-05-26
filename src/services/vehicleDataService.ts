
import { supabase } from '@/lib/supabase';
import { CarMake, CarModel } from '@/types/vehicle';

/**
 * Fetch all available car makes from the database
 */
export const fetchMakes = async (): Promise<CarMake[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_makes')
      .select('*')
      .order('make_display');

    if (error) {
      console.error('Error fetching makes:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching makes:', error);
    return [];
  }
};

/**
 * Fetch models for a specific make
 */
export const fetchModels = async (makeId: string): Promise<CarModel[]> => {
  try {
    if (!makeId) {
      return [];
    }

    const { data, error } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('model_make_id', makeId)
      .order('model_name');

    if (error) {
      console.error('Error fetching models:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};
