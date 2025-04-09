
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

/**
 * Delete a vehicle inspection
 */
export const deleteVehicleInspection = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('vehicle_inspections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle inspection:', error);
      toast({
        title: "Error deleting inspection",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error deleting vehicle inspection:', error);
    toast({
      title: "Error deleting inspection",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
};
