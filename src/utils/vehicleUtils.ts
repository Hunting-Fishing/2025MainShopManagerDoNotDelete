
import { supabase } from '@/lib/supabase';

/**
 * Get vehicle by ID from database
 */
export const getVehicleById = async (vehicleId: string) => {
  try {
    const { data, error } = await supabase
      .from('customer_vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
};
