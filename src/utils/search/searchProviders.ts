
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/customer";

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching customers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchCustomers:', error);
    return [];
  }
};

export const searchInventory = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching inventory:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in searchInventory:', error);
    return [];
  }
};

export const searchVehicles = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, customers(first_name, last_name)')
      .or(`make.ilike.%${query}%,model.ilike.%${query}%,vin.ilike.%${query}%,license_plate.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching vehicles:', error);
      return [];
    }
    
    // Transform the results to include customer name for display
    return (data || []).map(vehicle => ({
      ...vehicle,
      customerName: vehicle.customers ? 
        `${vehicle.customers.first_name} ${vehicle.customers.last_name}` : 
        'Unknown Customer'
    }));
  } catch (error) {
    console.error('Error in searchVehicles:', error);
    return [];
  }
};

export const searchWorkOrders = async (query: string): Promise<any[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*, customers(first_name, last_name), vehicles(make, model, year)')
      .or(`id.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching work orders:', error);
      return [];
    }
    
    // Transform the results to include customer and vehicle info
    return (data || []).map(order => ({
      ...order,
      customerName: order.customers ? 
        `${order.customers.first_name} ${order.customers.last_name}` : 
        'Unknown Customer',
      vehicleInfo: order.vehicles ? 
        `${order.vehicles.year} ${order.vehicles.make} ${order.vehicles.model}` : 
        'Unknown Vehicle'
    }));
  } catch (error) {
    console.error('Error in searchWorkOrders:', error);
    return [];
  }
};
