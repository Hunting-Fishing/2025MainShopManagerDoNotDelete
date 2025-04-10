
import { v4 as uuidv4 } from 'uuid';
import { WorkOrder } from '@/types/workOrder';
import { StaffMember } from '@/types/invoice';
import { supabase } from '@/lib/supabase';

// Function to fetch work orders from the database
export const fetchWorkOrders = async () => {
  try {
    const { data: workOrdersData, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (id, first_name, last_name),
        vehicles (id, make, model, year)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Transform the data to match our WorkOrder type
    const workOrders: WorkOrder[] = workOrdersData.map(wo => {
      const customer = wo.customers || {};
      const vehicle = wo.vehicles || {};
      
      const customerName = customer.first_name && customer.last_name 
        ? `${customer.first_name} ${customer.last_name}`
        : "Unknown Customer";
      
      const vehicleInfo = vehicle.make && vehicle.model 
        ? `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`
        : "Vehicle information not available";
        
      return {
        id: wo.id,
        customer_id: wo.customer_id || '',
        customer_name: customerName,
        customer: customerName, // Add this to match WorkOrder interface
        vehicle_id: wo.vehicle_id || '',
        vehicle_info: vehicleInfo,
        status: wo.status || 'pending',
        description: wo.description || '',
        total_cost: wo.total_cost || 0,
        timeEntries: [], // We'll fetch these separately if needed
        date: wo.created_at || new Date().toISOString(),
        dueDate: wo.updated_at || new Date().toISOString(),
        priority: "medium", // Default value
        technician: wo.technician_id || '',
        location: '', // Default value
        totalBillableTime: 0 // We'll calculate this if needed
      };
    });
    
    return workOrders;
  } catch (error) {
    console.error('Error fetching work orders:', error);
    // Return empty array with typed objects to avoid type errors
    return [];
  }
};

// Function to fetch inventory items from the database
export const fetchInventoryItems = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');
      
    if (error) {
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      sku: item.sku,
      category: item.category || '',
      quantity: item.quantity || 0,
      price: item.unit_price || 0,
      total: 0 // Will be calculated when item is added to invoice
    }));
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }
};

// Function to fetch staff members from the database
export const fetchStaffMembers = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, job_title')
      .order('first_name');
      
    if (error) {
      throw error;
    }
    
    // Transform the data to match our StaffMember type
    const staffMembers: StaffMember[] = data.map(profile => ({
      id: profile.id.toString(), // Convert to string to match our type
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Staff',
      role: profile.job_title || 'Staff'
    }));
    
    return staffMembers;
  } catch (error) {
    console.error('Error fetching staff members:', error);
    // Provide fallback data with string IDs to match StaffMember interface
    return [
      { id: "1", name: "John Smith", role: "Technician" },
      { id: "2", name: "Sarah Johnson", role: "Manager" },
      { id: "3", name: "Mike Davis", role: "Advisor" }
    ];
  }
};
