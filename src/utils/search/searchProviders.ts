
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/customer";
import { SearchResult } from "./types";

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
    // Fix the query to properly specify the foreign key relationship
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        customers:customer_id (
          first_name,
          last_name
        )
      `)
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
    // Fix the query to specify relationships between tables properly
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (first_name, last_name),
        vehicles:vehicle_id (make, model, year)
      `)
      .or(`id::text.ilike.%${query}%,description.ilike.%${query}%`)
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

// Add these functions that are imported in searchService.ts but were missing
export const searchInvoices = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers:customer_id (first_name, last_name)')
      .or(`id::text.ilike.%${query}%,description.ilike.%${query}%,customer.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching invoices:', error);
      return [];
    }
    
    return (data || []).map(invoice => ({
      id: invoice.id,
      title: `Invoice #${invoice.id}`,
      subtitle: `${invoice.customer} - $${invoice.total || 0}`,
      type: 'invoice',
      url: `/invoices/${invoice.id}`,
      relevance: 1
    }));
  } catch (error) {
    console.error('Error in searchInvoices:', error);
    return [];
  }
};

export const searchEquipment = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.length < 2) return [];
  
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .or(`name.ilike.%${query}%,model.ilike.%${query}%,serial_number.ilike.%${query}%`)
      .limit(10);
    
    if (error) {
      console.error('Error searching equipment:', error);
      return [];
    }
    
    return (data || []).map(equipment => ({
      id: equipment.id,
      title: equipment.name,
      subtitle: `${equipment.model} - ${equipment.category}`,
      type: 'equipment',
      url: `/equipment/${equipment.id}`,
      relevance: 1
    }));
  } catch (error) {
    console.error('Error in searchEquipment:', error);
    return [];
  }
};
