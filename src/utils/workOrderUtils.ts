
import { WorkOrder, TimeEntry, DbTimeEntry } from "@/types/workOrder";
import { supabase } from "@/integrations/supabase/client";

// Generate a unique work order ID
export const generateWorkOrderId = (): string => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WO-${dateStr}-${randomStr}`;
};

// Format date for display
export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Map time entry from DB format to app format
const mapTimeEntryFromDb = (entry: any): TimeEntry => ({
  id: entry.id,
  employeeId: entry.employee_id,
  employeeName: entry.employee_name,
  startTime: entry.start_time,
  endTime: entry.end_time,
  duration: entry.duration,
  notes: entry.notes || '',
  billable: entry.billable || false
});

// Database to app model mapping
const mapDatabaseToAppModel = (data: any): Partial<WorkOrder> => {
  const customers = data.customers as any || {};
  const profiles = data.profiles as any || {};
  const statusValue = data.status || 'pending';
  
  // Ensure status is one of the allowed values
  let typedStatus: WorkOrder["status"] = "pending";
  if (statusValue === "in-progress" || statusValue === "completed" || statusValue === "cancelled") {
    typedStatus = statusValue;
  }
  
  // Map time entries if they exist
  const timeEntries: TimeEntry[] = data.work_order_time_entries 
    ? data.work_order_time_entries.map((entry: any) => mapTimeEntryFromDb(entry))
    : [];
  
  return {
    id: data.id,
    date: data.created_at,
    customer: `${customers?.first_name || ''} ${customers?.last_name || ''}`.trim(),
    description: data.description || '',
    status: typedStatus,
    priority: data.priority || "medium",
    technician: `${profiles?.first_name || ''} ${profiles?.last_name || ''}`.trim() || 'Unassigned',
    location: data.location || '',
    dueDate: data.end_time || '',
    notes: data.notes || '',
    timeEntries: timeEntries,
    totalBillableTime: timeEntries.reduce((sum, entry) => 
      sum + (entry.billable ? (entry.duration || 0) : 0), 0) || 0,
    createdBy: data.created_by || 'System',
    createdAt: data.created_at,
    lastUpdatedBy: data.updated_by || '',
    lastUpdatedAt: data.updated_at,
    vehicle_id: data.vehicle_id,
    vehicleId: data.vehicle_id,
    service_category: data.service_category || '',
    serviceCategory: data.service_category || ''
  };
};

// Create a new work order
export const createWorkOrder = async (workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  try {
    const workOrderId = generateWorkOrderId();
    const currentDate = new Date().toISOString();

    // Helper function to convert camelCase to snake_case
    const mapCamelToSnakeCase = (data: any) => {
      const result: any = {};

      // Handle specific field mappings
      if (data.serviceCategory !== undefined) {
        result.service_category = data.serviceCategory;
      } else if (data.service_category !== undefined) {
        result.service_category = data.service_category;
      }

      // Handle vehicle properties
      if (data.vehicleId !== undefined) {
        result.vehicle_id = data.vehicleId;
      } else if (data.vehicle_id !== undefined) {
        result.vehicle_id = data.vehicle_id;
      }

      if (data.vehicleMake !== undefined) {
        result.vehicle_make = data.vehicleMake;
      } else if (data.vehicle_make !== undefined) {
        result.vehicle_make = data.vehicle_make;
      }

      if (data.vehicleModel !== undefined) {
        result.vehicle_model = data.vehicleModel;
      } else if (data.vehicle_model !== undefined) {
        result.vehicle_model = data.vehicle_model;
      }

      // Standard fields
      result.description = data.description;
      result.status = data.status;
      result.customer = data.customer;
      result.customer_id = typeof data.customer !== 'string' ? data.customer : null;
      result.technician = data.technician;
      result.technician_id = typeof data.technician !== 'string' ? data.technician : null;
      result.location = data.location;
      result.notes = data.notes || '';
      result.due_date = data.dueDate;
      result.end_time = data.dueDate; // Map dueDate to end_time for database
      result.priority = data.priority;
      result.total_cost = data.total_cost || 0;
      result.estimated_hours = data.estimated_hours || null;

      return result;
    };

    // Map the data for Supabase
    const dbWorkOrderData = mapCamelToSnakeCase(workOrderData);

    // Insert the work order
    const { data, error } = await supabase
      .from('work_orders')
      .insert(dbWorkOrderData)
      .select()
      .single();

    if (error) {
      console.error("Error creating work order:", error);
      throw new Error(error.message);
    }

    // After creating the work order, add any inventory items
    if (workOrderData.inventoryItems && workOrderData.inventoryItems.length > 0) {
      const inventoryItems = workOrderData.inventoryItems.map(item => ({
        work_order_id: data.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unitPrice
      }));

      const { error: inventoryError } = await supabase
        .from('work_order_inventory_items')
        .insert(inventoryItems);

      if (inventoryError) {
        console.error("Error adding inventory items:", inventoryError);
      }
    }

    // Add time entries if provided
    if (workOrderData.timeEntries && workOrderData.timeEntries.length > 0) {
      const timeEntries = workOrderData.timeEntries.map(entry => ({
        work_order_id: data.id,
        employee_id: entry.employeeId,
        employee_name: entry.employeeName,
        start_time: entry.startTime,
        end_time: entry.endTime,
        duration: entry.duration,
        notes: entry.notes || '',
        billable: entry.billable
      }));

      const { error: timeError } = await supabase
        .from('work_order_time_entries')
        .insert(timeEntries);

      if (timeError) {
        console.error("Error adding time entries:", timeError);
      }
    }

    // Create a base work order with required fields
    const baseWorkOrder: WorkOrder = {
      id: data.id,
      date: data.created_at,
      customer: workOrderData.customer,
      description: data.description,
      status: data.status as WorkOrder["status"],
      priority: workOrderData.priority,
      technician: workOrderData.technician,
      location: workOrderData.location,
      dueDate: data.end_time || '',
      notes: workOrderData.notes,
      inventoryItems: workOrderData.inventoryItems || [],
      timeEntries: workOrderData.timeEntries || [],
      totalBillableTime: workOrderData.totalBillableTime || 0,
      createdBy: workOrderData.createdBy || 'System',
      createdAt: data.created_at,
      lastUpdatedBy: workOrderData.lastUpdatedBy,
      lastUpdatedAt: data.updated_at,
      vehicle_id: data.vehicle_id,
      vehicleId: data.vehicle_id, // Include both casing conventions for frontend compatibility
    };
    
    // Handle service category assignment safely
    if (workOrderData.serviceCategory) {
      baseWorkOrder.serviceCategory = workOrderData.serviceCategory;
      baseWorkOrder.service_category = workOrderData.serviceCategory;
    } else if (workOrderData.service_category) {
      baseWorkOrder.serviceCategory = workOrderData.service_category;
      baseWorkOrder.service_category = workOrderData.service_category;
    }

    return baseWorkOrder;
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
        customers(first_name, last_name),
        profiles(first_name, last_name),
        work_order_time_entries(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error finding work order:", error);
      return null;
    }
    
    if (!data) return null;
    
    // Map database model to application model
    return mapDatabaseToAppModel(data) as WorkOrder;
  } catch (err) {
    console.error("Error in findWorkOrderById:", err);
    return null;
  }
};

// Update a work order
export const updateWorkOrder = async (updatedWorkOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    // Map from app model to database model
    const dbData: any = {
      description: updatedWorkOrder.description,
      status: updatedWorkOrder.status,
      priority: updatedWorkOrder.priority,
      notes: updatedWorkOrder.notes,
      end_time: updatedWorkOrder.dueDate,
      // Add more fields as needed
    };
    
    // Handle snake_case fields that might not be in the database schema
    if (updatedWorkOrder.service_category || updatedWorkOrder.serviceCategory) {
      dbData.service_category = updatedWorkOrder.service_category || updatedWorkOrder.serviceCategory;
    }
    
    const { data, error } = await supabase
      .from('work_orders')
      .update(dbData)
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

// Delete a work order
export const deleteWorkOrder = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting work order:", error);
      throw new Error(error.message);
    }

    return true;
  } catch (err) {
    console.error("Error in deleteWorkOrder:", err);
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
