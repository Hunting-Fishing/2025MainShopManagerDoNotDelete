
import { supabase } from '@/lib/supabase';

// Get all vendors
export async function getAllVendors() {
  try {
    const { data, error } = await supabase
      .from('inventory_vendors')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return [];
  }
}

// Get vendor by ID
export async function getVendorById(id: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_vendors')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching vendor ${id}:`, error);
    return null;
  }
}
