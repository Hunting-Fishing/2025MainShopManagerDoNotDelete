
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { VehicleBodyStyle } from '@/types/vehicleBodyStyles';

export interface DamageArea {
  id: string;
  name: string;
  isDamaged: boolean;
  damageType: string | null;
  notes: string;
}

export interface VehicleInspection {
  id?: string;
  vehicleId: string;
  technicianId: string;
  inspectionDate: Date;
  vehicleBodyStyle: VehicleBodyStyle;
  status: 'draft' | 'completed' | 'pending' | 'approved';
  damageAreas: DamageArea[];
  notes?: string;
}

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
          damage_areas: inspection.damageAreas,
          notes: inspection.notes
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating vehicle inspection:', error);
      throw error;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error creating vehicle inspection:', error);
    throw error;
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
    if (inspection.damageAreas) updateData.damage_areas = inspection.damageAreas;
    if (inspection.notes !== undefined) updateData.notes = inspection.notes;
    
    const { error } = await supabase
      .from('vehicle_inspections')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating vehicle inspection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating vehicle inspection:', error);
    return false;
  }
};

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
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      vehicleId: data.vehicle_id,
      technicianId: data.technician_id,
      inspectionDate: new Date(data.inspection_date),
      vehicleBodyStyle: data.vehicle_body_style as VehicleBodyStyle,
      status: data.status as VehicleInspection['status'],
      damageAreas: data.damage_areas || [],
      notes: data.notes
    };
  } catch (error) {
    console.error('Error fetching vehicle inspection:', error);
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
      return [];
    }

    return data.map(item => ({
      id: item.id,
      vehicleId: item.vehicle_id,
      technicianId: item.technician_id,
      inspectionDate: new Date(item.inspection_date),
      vehicleBodyStyle: item.vehicle_body_style as VehicleBodyStyle,
      status: item.status as VehicleInspection['status'],
      damageAreas: item.damage_areas || [],
      notes: item.notes
    }));
  } catch (error) {
    console.error('Error fetching vehicle inspections:', error);
    return [];
  }
};

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
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting vehicle inspection:', error);
    return false;
  }
};
