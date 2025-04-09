
import { supabase } from '@/lib/supabase';
import { convertToJson, VehicleInspection } from './types';
import { v4 as uuidv4 } from 'uuid';

// Create a new vehicle inspection
export const createVehicleInspection = async (inspection: Omit<VehicleInspection, 'id'>): Promise<string | null> => {
  try {
    const newId = uuidv4();
    
    const { error } = await supabase
      .from('vehicle_inspections')
      .insert({
        id: newId,
        vehicle_id: inspection.vehicleId,
        technician_id: inspection.technicianId,
        inspection_date: inspection.inspectionDate.toISOString(),
        vehicle_body_style: inspection.vehicleBodyStyle,
        status: inspection.status,
        damage_areas: convertToJson(inspection.damageAreas),
        notes: inspection.notes
      });

    if (error) {
      console.error('Error creating vehicle inspection:', error);
      return null;
    }

    return newId;
  } catch (error) {
    console.error('Error creating vehicle inspection:', error);
    return null;
  }
};

// Update an existing vehicle inspection
export const updateVehicleInspection = async (id: string, inspection: Partial<VehicleInspection>): Promise<boolean> => {
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
    console.error('Error updating vehicle inspection:', error);
    return false;
  }
};
