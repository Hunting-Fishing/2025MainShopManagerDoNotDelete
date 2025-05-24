
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

    return data || [];
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

    return data || [];
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

    const { data, error } = await supabase
      .from('equipment')
      .insert([{ ...equipmentData, shop_id: profiles.shop_id }])
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
    const { data, error } = await supabase
      .from('equipment')
      .update(equipmentData)
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
