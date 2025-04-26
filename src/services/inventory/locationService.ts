
import { supabase } from '@/lib/supabase';

// Get all inventory locations
export async function getInventoryLocations() {
  try {
    const { data, error } = await supabase
      .from('inventory_locations')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inventory locations:', error);
    return [];
  }
}

// Create a new inventory location
export async function createInventoryLocation(location: any) {
  try {
    const { data, error } = await supabase
      .from('inventory_locations')
      .insert(location)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating inventory location:', error);
    return null;
  }
}
