
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
      .eq('make_id', makeId)
      .order('model_display');

    if (error) {
      console.error('Error fetching models:', error);
      return [];
    }

    // Transform database fields to match CarModel interface
    return (data || []).map(model => ({
      id: model.id,
      make_id: model.make_id,
      model_id: model.model_id,
      model_name: model.model_display, // Use model_display as model_name
      model_display: model.model_display,
      created_at: model.created_at,
      updated_at: model.updated_at
    }));
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};
