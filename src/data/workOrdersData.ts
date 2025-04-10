
import { supabase } from '@/lib/supabase';

// Define work order type
export interface WorkOrder {
  id: string;
  date: string;
  customer: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  technician: string;
  location: string;
  dueDate: string;
  notes?: string;
  inventoryItems?: any[];
  timeEntries?: any[];
  serviceCategory?: string;
  vehicleId?: string;
  vehicleDetails?: {
    make?: string;
    model?: string;
    year?: string;
    odometer?: string;
    licensePlate?: string;
  };
  totalBillableTime?: number;
  createdBy?: string;
  createdAt?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

// Define status colors and labels
export const statusMap: Record<string, string> = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

// Add WorkOrderStatus export for components that import it
export const WorkOrderStatus = statusMap;

// Define priority display properties
export const priorityMap: Record<
  string, 
  { label: string; classes: string; }
> = {
  "low": {
    label: "Low",
    classes: "bg-slate-100 text-slate-700"
  },
  "medium": {
    label: "Medium",
    classes: "bg-blue-100 text-blue-700"
  },
  "high": {
    label: "High", 
    classes: "bg-red-100 text-red-700"
  }
};

// Fetch work orders from Supabase
export const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (first_name, last_name),
        profiles:technician_id (first_name, last_name),
        work_order_time_entries (*)
      `)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching work orders:", error);
      return [];
    }
    
    return data.map(wo => ({
      id: wo.id,
      date: wo.created_at,
      customer: `${wo.customers?.first_name || ''} ${wo.customers?.last_name || ''}`.trim(),
      description: wo.description || '',
      status: wo.status || 'pending',
      priority: determinePriority(wo),
      technician: `${wo.profiles?.first_name || ''} ${wo.profiles?.last_name || ''}`.trim() || 'Unassigned',
      location: '', // Not available in schema yet
      dueDate: wo.end_time || '',
      notes: '',
      totalBillableTime: wo.work_order_time_entries?.reduce((sum, entry) => 
        sum + (entry.billable ? (entry.duration || 0) : 0), 0) || 0,
      createdBy: 'System',
      createdAt: wo.created_at,
      lastUpdatedBy: '',
      lastUpdatedAt: wo.updated_at
    }));
  } catch (err) {
    console.error("Error in fetchWorkOrders:", err);
    return [];
  }
};

// Helper function to determine priority based on work order properties
const determinePriority = (workOrder: any): "low" | "medium" | "high" => {
  // Logic to determine priority - could be enhanced based on business rules
  const hoursSinceCreation = Math.floor(
    (new Date().getTime() - new Date(workOrder.created_at).getTime()) / (1000 * 60 * 60)
  );
  
  if (hoursSinceCreation > 48) return "high";
  if (hoursSinceCreation > 24) return "medium";
  return "low";
};

// Create a new work order
export const createWorkOrder = async (workOrder: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .insert({
        description: workOrder.description,
        status: workOrder.status || 'pending',
        customer_id: typeof workOrder.customer === 'string' ? null : workOrder.customer,
        technician_id: typeof workOrder.technician === 'string' ? null : workOrder.technician,
        // Map other fields as needed
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating work order:", error);
      throw new Error(error.message);
    }
    
    return {
      id: data.id,
      date: data.created_at,
      customer: workOrder.customer,
      description: data.description,
      status: data.status,
      priority: workOrder.priority,
      technician: workOrder.technician,
      location: workOrder.location,
      dueDate: data.end_time || '',
      notes: workOrder.notes,
      totalBillableTime: 0,
      createdBy: 'System',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Error in createWorkOrder:", err);
    throw err;
  }
};

// Find a work order by ID
export const findWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (first_name, last_name),
        profiles:technician_id (first_name, last_name),
        work_order_time_entries (*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error finding work order:", error);
      return null;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      date: data.created_at,
      customer: `${data.customers?.first_name || ''} ${data.customers?.last_name || ''}`.trim(),
      description: data.description || '',
      status: data.status || 'pending',
      priority: determinePriority(data),
      technician: `${data.profiles?.first_name || ''} ${data.profiles?.last_name || ''}`.trim() || 'Unassigned',
      location: '', // Not available in schema yet
      dueDate: data.end_time || '',
      notes: '',
      timeEntries: data.work_order_time_entries || [],
      totalBillableTime: data.work_order_time_entries?.reduce((sum, entry) => 
        sum + (entry.billable ? (entry.duration || 0) : 0), 0) || 0,
      createdBy: 'System',
      createdAt: data.created_at,
      lastUpdatedBy: '',
      lastUpdatedAt: data.updated_at
    };
  } catch (err) {
    console.error("Error in findWorkOrderById:", err);
    return null;
  }
};

// Update a work order
export const updateWorkOrder = async (updatedWorkOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .update({
        description: updatedWorkOrder.description,
        status: updatedWorkOrder.status,
        // Map other fields as needed
      })
      .eq('id', updatedWorkOrder.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating work order:", error);
      throw new Error(error.message);
    }
    
    return {
      ...updatedWorkOrder,
      lastUpdatedAt: data.updated_at
    };
  } catch (err) {
    console.error("Error in updateWorkOrder:", err);
    throw err;
  }
};

// Add missing utility functions
export const formatTimeInHoursAndMinutes = (minutes: number): string => {
  if (!minutes) return '0h 0m';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${remainingMinutes}m`;
};

// Get unique technicians for filtering
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`id, first_name, last_name`)
      .order('first_name');
      
    if (error) {
      console.error("Error fetching technicians:", error);
      return [];
    }
    
    return data
      .map(profile => `${profile.first_name || ''} ${profile.last_name || ''}`.trim())
      .filter(name => name.length > 0)
      .sort();
  } catch (err) {
    console.error("Error in getUniqueTechnicians:", err);
    return [];
  }
};
