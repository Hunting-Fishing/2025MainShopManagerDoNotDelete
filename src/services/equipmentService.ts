
import { supabase } from "@/integrations/supabase/client";

export interface EquipmentWithMaintenance {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  manufacturer: string;
  category: string;
  customer: string;
  location: string;
  status: string;
  next_maintenance_date: string;
  maintenance_frequency: string;
  last_maintenance_date: string;
  warranty_expiry_date: string;
  warranty_status: string;
  notes?: string;
  maintenance_history?: any[];
  maintenance_schedules?: any[];
}

export const fetchEquipment = async (): Promise<EquipmentWithMaintenance[]> => {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profiles?.shop_id) {
      console.warn('No shop_id found for user');
      return [];
    }

    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('shop_id', profiles.shop_id)
      .order('name');

    if (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }

    // Transform database response to match EquipmentWithMaintenance interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      manufacturer: item.manufacturer || '',
      category: item.category || '',
      customer: item.customer || '',
      location: item.location || '',
      status: item.status || 'operational',
      next_maintenance_date: item.next_maintenance_date || '',
      maintenance_frequency: item.maintenance_frequency || 'quarterly',
      last_maintenance_date: item.last_maintenance_date || '',
      warranty_expiry_date: item.warranty_expiry_date || '',
      warranty_status: item.warranty_status || 'active',
      notes: item.notes || '',
      maintenance_history: Array.isArray(item.maintenance_history) ? item.maintenance_history : [],
      maintenance_schedules: Array.isArray(item.maintenance_schedules) ? item.maintenance_schedules : []
    }));
  } catch (error) {
    console.error('Error in fetchEquipment:', error);
    return [];
  }
};

export const getOverdueMaintenanceEquipment = async (): Promise<EquipmentWithMaintenance[]> => {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profiles?.shop_id) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('shop_id', profiles.shop_id)
      .lt('next_maintenance_date', today)
      .order('next_maintenance_date');

    if (error) {
      console.error('Error fetching overdue equipment:', error);
      return [];
    }

    // Transform database response to match EquipmentWithMaintenance interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      manufacturer: item.manufacturer || '',
      category: item.category || '',
      customer: item.customer || '',
      location: item.location || '',
      status: item.status || 'operational',
      next_maintenance_date: item.next_maintenance_date || '',
      maintenance_frequency: item.maintenance_frequency || 'quarterly',
      last_maintenance_date: item.last_maintenance_date || '',
      warranty_expiry_date: item.warranty_expiry_date || '',
      warranty_status: item.warranty_status || 'active',
      notes: item.notes || '',
      maintenance_history: Array.isArray(item.maintenance_history) ? item.maintenance_history : [],
      maintenance_schedules: Array.isArray(item.maintenance_schedules) ? item.maintenance_schedules : []
    }));
  } catch (error) {
    console.error('Error in getOverdueMaintenanceEquipment:', error);
    return [];
  }
};

export const createEquipment = async (equipmentData: Partial<EquipmentWithMaintenance>) => {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('shop_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profiles?.shop_id) {
      throw new Error('No shop_id found for user');
    }

    // Transform to database column names
    const dbData = {
      shop_id: profiles.shop_id,
      name: equipmentData.name,
      model: equipmentData.model,
      serial_number: equipmentData.serial_number,
      manufacturer: equipmentData.manufacturer,
      category: equipmentData.category,
      customer: equipmentData.customer,
      location: equipmentData.location,
      status: equipmentData.status,
      next_maintenance_date: equipmentData.next_maintenance_date,
      maintenance_frequency: equipmentData.maintenance_frequency,
      last_maintenance_date: equipmentData.last_maintenance_date,
      warranty_expiry_date: equipmentData.warranty_expiry_date,
      warranty_status: equipmentData.warranty_status,
      notes: equipmentData.notes
    };

    const { data, error } = await supabase
      .from('equipment')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw error;
  }
};

export const updateEquipment = async (id: string, equipmentData: Partial<EquipmentWithMaintenance>) => {
  try {
    // Transform to database column names
    const dbData = {
      name: equipmentData.name,
      model: equipmentData.model,
      serial_number: equipmentData.serial_number,
      manufacturer: equipmentData.manufacturer,
      category: equipmentData.category,
      customer: equipmentData.customer,
      location: equipmentData.location,
      status: equipmentData.status,
      next_maintenance_date: equipmentData.next_maintenance_date,
      maintenance_frequency: equipmentData.maintenance_frequency,
      last_maintenance_date: equipmentData.last_maintenance_date,
      warranty_expiry_date: equipmentData.warranty_expiry_date,
      warranty_status: equipmentData.warranty_status,
      notes: equipmentData.notes
    };

    const { data, error } = await supabase
      .from('equipment')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
};
