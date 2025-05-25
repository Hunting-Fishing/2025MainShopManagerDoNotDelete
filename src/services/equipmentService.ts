

import { supabase } from "@/integrations/supabase/client";
import type { Equipment, EquipmentStatus, MaintenanceRecord, MaintenanceSchedule } from "@/types/equipment";

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

    // Transform the data to match our interface
    return (data || []).map(item => ({
      ...item,
      status: item.status as EquipmentStatus,
      shop_id: null, // Equipment table doesn't have shop_id, so set to null
      work_order_history: Array.isArray(item.work_order_history) ? item.work_order_history as any[] : [],
      maintenance_history: Array.isArray(item.maintenance_history) ? (item.maintenance_history as unknown) as MaintenanceRecord[] : [],
      maintenance_schedules: Array.isArray(item.maintenance_schedules) ? (item.maintenance_schedules as unknown) as MaintenanceSchedule[] : [],
    }));
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

    return (data || []).map(item => ({
      ...item,
      status: item.status as EquipmentStatus,
      shop_id: null, // Equipment table doesn't have shop_id, so set to null
      work_order_history: Array.isArray(item.work_order_history) ? item.work_order_history as any[] : [],
      maintenance_history: Array.isArray(item.maintenance_history) ? (item.maintenance_history as unknown) as MaintenanceRecord[] : [],
      maintenance_schedules: Array.isArray(item.maintenance_schedules) ? (item.maintenance_schedules as unknown) as MaintenanceSchedule[] : [],
    }));
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
    const { data, error } = await supabase
      .from('equipment')
      .insert({
        name: equipmentData.name,
        model: equipmentData.model || '',
        serial_number: equipmentData.serial_number || '',
        manufacturer: equipmentData.manufacturer || '',
        category: equipmentData.category,
        purchase_date: equipmentData.purchase_date || '',
        install_date: equipmentData.install_date || '',
        customer: equipmentData.customer,
        location: equipmentData.location || '',
        status: equipmentData.status || 'operational',
        next_maintenance_date: equipmentData.next_maintenance_date || '',
        maintenance_frequency: equipmentData.maintenance_frequency || 'quarterly',
        last_maintenance_date: equipmentData.last_maintenance_date || '',
        warranty_expiry_date: equipmentData.warranty_expiry_date || '',
        warranty_status: equipmentData.warranty_status || '',
        notes: equipmentData.notes || '',
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating equipment:", error);
      throw error;
    }

    return {
      ...data,
      status: data.status as EquipmentStatus,
      shop_id: null, // Equipment table doesn't have shop_id, so set to null
      work_order_history: [],
      maintenance_history: [],
      maintenance_schedules: [],
    };
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

    return {
      ...data,
      status: data.status as EquipmentStatus,
      shop_id: null, // Equipment table doesn't have shop_id, so set to null
      work_order_history: Array.isArray(data.work_order_history) ? data.work_order_history as any[] : [],
      maintenance_history: Array.isArray(data.maintenance_history) ? (data.maintenance_history as unknown) as MaintenanceRecord[] : [],
      maintenance_schedules: Array.isArray(data.maintenance_schedules) ? (data.maintenance_schedules as unknown) as MaintenanceSchedule[] : [],
    };
  } catch (error) {
    console.error("Error in updateEquipment:", error);
    return null;
  }
};

