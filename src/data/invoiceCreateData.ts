import { v4 as uuidv4 } from 'uuid';
import { WorkOrder } from '@/types/workOrder';
import { StaffMember } from '@/types/invoice';
import { supabase } from '@/lib/supabase';

// Helper function to safely access properties
const safeProp = <T extends Record<string, any>>(obj: T | null | undefined, key: keyof T): any => {
  if (!obj) return '';
  return obj[key] || '';
};

// Helper function to safely check if an object is an array
const isArray = (obj: any): obj is Array<any> => {
  return Array.isArray(obj);
};

// Function to generate a customer name from customer data
export function getCustomerName(customer: any): string {
  if (!customer) return '';
  
  // If it's an array, we need to handle it differently
  if (isArray(customer)) {
    if (customer.length > 0) {
      return `${safeProp(customer[0], 'first_name')} ${safeProp(customer[0], 'last_name')}`;
    }
    return '';
  }
  
  // Otherwise it's an object
  return `${safeProp(customer, 'first_name')} ${safeProp(customer, 'last_name')}`;
}

// Function to generate a vehicle description
export function getVehicleDescription(vehicle: any): string {
  if (!vehicle) return '';
  
  // If it's an array, handle it differently
  if (isArray(vehicle)) {
    if (vehicle.length > 0) {
      return `${safeProp(vehicle[0], 'year')} ${safeProp(vehicle[0], 'make')} ${safeProp(vehicle[0], 'model')}`;
    }
    return '';
  }
  
  // Otherwise it's an object
  return `${safeProp(vehicle, 'year')} ${safeProp(vehicle, 'make')} ${safeProp(vehicle, 'model')}`;
}

// Define work order statuses
export const workOrderStatuses = [
  'New',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled'
];

// Define invoice statuses
export const invoiceStatuses = [
  'Draft',
  'Pending',
  'Paid',
  'Overdue',
  'Cancelled'
];

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
      const customer = wo.customers || { first_name: "Unknown", last_name: "Customer" };
      const vehicle = wo.vehicles || { make: "", model: "", year: "" };
      
      const customerName = getCustomerName(customer);
      
      const vehicleInfo = getVehicleDescription(vehicle);
        
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
    // Return mock data
    return [
      {
        id: "wo-1234",
        customer_id: "cust-1",
        customer_name: "John Doe",
        customer: "John Doe",
        vehicle_id: "veh-1",
        vehicle_info: "2019 Toyota Camry",
        status: "in-progress",
        description: "Regular maintenance and oil change",
        total_cost: 149.99,
        timeEntries: [],
        date: "2023-05-20",
        dueDate: "2023-05-27",
        priority: "medium",
        technician: "tech-1",
        location: "Bay 3",
        totalBillableTime: 1.5
      },
      {
        id: "wo-1235",
        customer_id: "cust-2",
        customer_name: "Jane Smith",
        customer: "Jane Smith",
        vehicle_id: "veh-2",
        vehicle_info: "2018 Honda Accord",
        status: "completed",
        description: "Brake pad replacement and rotor inspection",
        total_cost: 299.99,
        timeEntries: [],
        date: "2023-05-18",
        dueDate: "2023-05-25",
        priority: "high",
        technician: "tech-2",
        location: "Bay 5",
        totalBillableTime: 2.5
      }
    ];
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
    // Return mock data
    return [
      { id: "item-1", name: "Oil Filter", description: "Standard oil filter", sku: "OF-1234", category: "Filters", quantity: 1, price: 12.99, total: 12.99 },
      { id: "item-2", name: "Synthetic Oil (1 quart)", description: "Full synthetic motor oil", sku: "OIL-5678", category: "Fluids", quantity: 5, price: 9.99, total: 49.95 },
      { id: "item-3", name: "Brake Pads (Front)", description: "Ceramic front brake pads", sku: "BP-9012", category: "Brakes", quantity: 1, price: 45.99, total: 45.99 }
    ];
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
