
import { supabase } from "@/integrations/supabase/client";
import type { Equipment, EquipmentStatus, MaintenanceRecord, MaintenanceSchedule } from "@/types/equipment";
import { transformEquipmentData, prepareEquipmentForInsert } from "@/utils/equipment/typeUtils";

// Define the interface that matches the actual database structure
export interface EquipmentWithMaintenance extends Equipment {
  shop_id?: string | null;
}

export const fetchEquipment = async (): Promise<EquipmentWithMaintenance[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching equipment:", error);
      throw error;
    }

    return (data || []).map(transformEquipmentData);
  } catch (error) {
    console.error("Error in fetchEquipment:", error);
    return [];
  }
};

export const getOverdueMaintenanceEquipment = async (): Promise<EquipmentWithMaintenance[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .lt('next_maintenance_date', today)
      .not('next_maintenance_date', 'is', null);

    if (error) {
      console.error("Error fetching overdue equipment:", error);
      throw error;
    }

    return (data || []).map(transformEquipmentData);
  } catch (error) {
    console.error("Error in getOverdueMaintenanceEquipment:", error);
    return [];
  }
};

export interface CreateEquipmentData {
  name: string;
  model?: string;
  serial_number?: string;
  manufacturer?: string;
  category: string;
  purchase_date?: string;
  install_date?: string;
  customer: string;
  location?: string;
  status?: EquipmentStatus;
  next_maintenance_date?: string;
  maintenance_frequency?: string;
  last_maintenance_date?: string;
  warranty_expiry_date?: string;
  warranty_status?: string;
  notes?: string;
}

export const createEquipment = async (equipmentData: CreateEquipmentData): Promise<EquipmentWithMaintenance | null> => {
  try {
    // Use the utility function to prepare data for insertion
    const insertData = prepareEquipmentForInsert(equipmentData);

    const { data, error } = await supabase
      .from('equipment')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating equipment:", error);
      throw error;
    }

    return transformEquipmentData(data);
  } catch (error) {
    console.error("Error in createEquipment:", error);
    return null;
  }
};

export const updateEquipment = async (id: string, updates: Partial<CreateEquipmentData>): Promise<EquipmentWithMaintenance | null> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating equipment:", error);
      throw error;
    }

    return transformEquipmentData(data);
  } catch (error) {
    console.error("Error in updateEquipment:", error);
    return null;
  }
};
