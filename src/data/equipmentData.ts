
import { supabase } from "@/lib/supabase";
import { fetchWorkOrders } from "./workOrdersData";

// Equipment data types
export interface Equipment {
  id: string;
  name: string;
  customer: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  category: string;
  status: string;
  purchaseDate: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceFrequency: string;
  location: string;
  notes?: string;
}

// Fetch equipment data from Supabase
export const fetchEquipment = async (): Promise<Equipment[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('name');
      
    if (error) {
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      customer: item.customer,
      serialNumber: item.serial_number,
      model: item.model,
      manufacturer: item.manufacturer,
      category: item.category,
      status: item.status,
      purchaseDate: item.purchase_date,
      lastMaintenanceDate: item.last_maintenance_date,
      nextMaintenanceDate: item.next_maintenance_date,
      maintenanceFrequency: item.maintenance_frequency,
      location: item.location,
      notes: item.notes
    }));
  } catch (err) {
    console.error("Error fetching equipment:", err);
    return [];
  }
};

// Fetch equipment categories
export const fetchEquipmentCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('category');
      
    if (error) {
      throw error;
    }
    
    // Extract unique categories
    const categories = data.map(item => item.category);
    return [...new Set(categories)].sort();
  } catch (err) {
    console.error("Error fetching equipment categories:", err);
    return [];
  }
};
