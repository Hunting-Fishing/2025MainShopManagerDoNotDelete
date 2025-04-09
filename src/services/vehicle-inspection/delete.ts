
import { supabase } from '@/lib/supabase';

// Delete a vehicle inspection
export const deleteVehicleInspection = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vehicle_inspections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle inspection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vehicle inspection:', error);
    return false;
  }
};
