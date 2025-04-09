
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VehicleInspection, convertToDamageAreas, convertToJson } from './types';

/**
 * Create a new vehicle inspection
 */
export const createVehicleInspection = async (inspection: VehicleInspection): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .insert([
        {
          vehicle_id: inspection.vehicleId,
          technician_id: inspection.technicianId,
          inspection_date: inspection.inspectionDate.toISOString(),
          vehicle_body_style: inspection.vehicleBodyStyle,
          status: inspection.status,
          damage_areas: convertToJson(inspection.damageAreas), 
          notes: inspection.notes
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating vehicle inspection:', error);
      toast({
        title: "Error creating inspection",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    return data?.id || null;
  } catch (error: any) {
    console.error('Error creating vehicle inspection:', error);
    toast({
      title: "Error creating inspection",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Update an existing vehicle inspection
 */
export const updateVehicleInspection = async (id: string, inspection: Partial<VehicleInspection>): Promise<boolean> => {
  try {
    const updateData: any = {};
    
    if (inspection.vehicleBodyStyle) updateData.vehicle_body_style = inspection.vehicleBodyStyle;
    if (inspection.status) updateData.status = inspection.status;
    if (inspection.damageAreas) updateData.damage_areas = convertToJson(inspection.damageAreas);
    if (inspection.notes !== undefined) updateData.notes = inspection.notes;
    
    const { error } = await supabase
      .from('vehicle_inspections')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating vehicle inspection:', error);
      toast({
        title: "Error updating inspection",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Error updating vehicle inspection:', error);
    toast({
      title: "Error updating inspection",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return false;
  }
};
