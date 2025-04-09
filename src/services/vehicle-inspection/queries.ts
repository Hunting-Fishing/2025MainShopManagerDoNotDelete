
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { VehicleInspection, VehicleBodyStyle, convertToDamageAreas } from './types';

/**
 * Get a single vehicle inspection by ID
 */
export const getVehicleInspection = async (id: string): Promise<VehicleInspection | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .select('*, vehicles(make, model, year, vin, color)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vehicle inspection:', error);
      toast({
        title: "Error loading inspection",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    if (!data) return null;

    // Map database record to VehicleInspection type
    return {
      id: data.id,
      vehicleId: data.vehicle_id,
      technicianId: data.technician_id,
      inspectionDate: new Date(data.inspection_date),
      vehicleBodyStyle: data.vehicle_body_style as VehicleBodyStyle,
      status: data.status as VehicleInspection['status'],
      damageAreas: convertToDamageAreas(data.damage_areas),
      notes: data.notes
    };
  } catch (error: any) {
    console.error('Error fetching vehicle inspection:', error);
    toast({
      title: "Error loading inspection",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Get all inspections for a specific vehicle
 */
export const getVehicleInspections = async (vehicleId: string): Promise<VehicleInspection[]> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('inspection_date', { ascending: false });

    if (error) {
      console.error('Error fetching vehicle inspections:', error);
      toast({
        title: "Error loading inspections",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }

    return data.map(item => ({
      id: item.id,
      vehicleId: item.vehicle_id,
      technicianId: item.technician_id,
      inspectionDate: new Date(item.inspection_date),
      vehicleBodyStyle: item.vehicle_body_style as VehicleBodyStyle,
      status: item.status as VehicleInspection['status'],
      damageAreas: convertToDamageAreas(item.damage_areas),
      notes: item.notes
    }));
  } catch (error: any) {
    console.error('Error fetching vehicle inspections:', error);
    toast({
      title: "Error loading inspections",
      description: error.message || "An unexpected error occurred",
      variant: "destructive",
    });
    return [];
  }
};
