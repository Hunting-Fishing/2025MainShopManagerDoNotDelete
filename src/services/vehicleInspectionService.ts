
import { supabase } from '@/lib/supabase';
import { VehicleBodyStyle } from '@/types/vehicleBodyStyles';

export interface DamageArea {
  id: string;
  panelId: string;
  panelName: string;
  damageType: string;
  notes?: string;
  photoUrls?: string[];
  timestamp: string;
}

export interface VehicleInspection {
  id: string;
  vehicleId: string;
  technicianId: string;
  inspectionDate: Date;
  vehicleBodyStyle: VehicleBodyStyle;
  status: 'draft' | 'completed' | 'approved' | 'rejected';
  damageAreas: DamageArea[];
  notes?: string;
}

// Convert DamageAreas array to a format suitable for JSON storage
export const convertToJson = (damageAreas: DamageArea[]) => {
  return damageAreas;
};

// Convert from JSON to typed DamageArea objects
export const convertToDamageAreas = (json: any): DamageArea[] => {
  if (!json || !Array.isArray(json)) return [];
  
  return json.map(item => ({
    id: item.id || `damage-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    panelId: item.panelId,
    panelName: item.panelName,
    damageType: item.damageType,
    notes: item.notes,
    photoUrls: item.photoUrls || [],
    timestamp: item.timestamp || new Date().toISOString()
  }));
};

// Create a new vehicle inspection
export const createVehicleInspection = async (
  inspection: Omit<VehicleInspection, 'id'>
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .insert({
        vehicle_id: inspection.vehicleId,
        technician_id: inspection.technicianId,
        inspection_date: inspection.inspectionDate.toISOString(),
        vehicle_body_style: inspection.vehicleBodyStyle,
        status: inspection.status,
        damage_areas: convertToJson(inspection.damageAreas),
        notes: inspection.notes
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating vehicle inspection:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createVehicleInspection:', error);
    return null;
  }
};

// Update an existing vehicle inspection
export const updateVehicleInspection = async (
  id: string,
  inspection: Partial<VehicleInspection>
): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {};
    
    if (inspection.vehicleId) updates.vehicle_id = inspection.vehicleId;
    if (inspection.technicianId) updates.technician_id = inspection.technicianId;
    if (inspection.inspectionDate) updates.inspection_date = inspection.inspectionDate.toISOString();
    if (inspection.vehicleBodyStyle) updates.vehicle_body_style = inspection.vehicleBodyStyle;
    if (inspection.status) updates.status = inspection.status;
    if (inspection.damageAreas) updates.damage_areas = convertToJson(inspection.damageAreas);
    if (inspection.notes !== undefined) updates.notes = inspection.notes;

    const { error } = await supabase
      .from('vehicle_inspections')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating vehicle inspection:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateVehicleInspection:', error);
    return false;
  }
};

// Get a single vehicle inspection
export const getVehicleInspection = async (id: string): Promise<VehicleInspection | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicle_inspections')
      .select('*')
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
      damageAreas: convertToDamageAreas(data.damage_areas),
      notes: data.notes
    };
  } catch (error) {
    console.error('Error in getVehicleInspection:', error);
    return null;
  }
};

// Get all inspections for a vehicle
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
      damageAreas: convertToDamageAreas(item.damage_areas),
      notes: item.notes
    }));
  } catch (error) {
    console.error('Error in getVehicleInspections:', error);
    return [];
  }
};

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
    console.error('Error in deleteVehicleInspection:', error);
    return false;
  }
};
