
import { WorkOrder, statusMap, priorityMap } from "@/data/workOrdersData";
import { toast } from "@/hooks/use-toast";
import { handleApiError } from "@/utils/errorHandling";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";

// Maps our application WorkOrder type to Supabase database format
const mapToDbWorkOrder = (workOrder: Partial<WorkOrder>) => {
  return {
    id: workOrder.id,
    customer: workOrder.customer,
    description: workOrder.description,
    status: workOrder.status,
    priority: workOrder.priority,
    date: workOrder.date,
    due_date: workOrder.dueDate,
    technician: workOrder.technician,
    location: workOrder.location,
    notes: workOrder.notes,
    total_billable_time: workOrder.totalBillableTime,
    created_by: workOrder.createdBy,
    created_at: workOrder.createdAt,
    last_updated_by: workOrder.lastUpdatedBy,
    last_updated_at: workOrder.lastUpdatedAt
  };
};

// Maps from Supabase to our application WorkOrder format
const mapFromDbWorkOrder = (dbWorkOrder: any, timeEntries: TimeEntry[] = [], inventoryItems: WorkOrderInventoryItem[] = []): WorkOrder => {
  return {
    id: dbWorkOrder.id,
    customer: dbWorkOrder.customer,
    description: dbWorkOrder.description || '',
    status: dbWorkOrder.status,
    priority: dbWorkOrder.priority,
    date: dbWorkOrder.date,
    dueDate: dbWorkOrder.due_date,
    technician: dbWorkOrder.technician,
    location: dbWorkOrder.location,
    notes: dbWorkOrder.notes || '',
    totalBillableTime: dbWorkOrder.total_billable_time || 0,
    createdBy: dbWorkOrder.created_by,
    createdAt: dbWorkOrder.created_at,
    lastUpdatedBy: dbWorkOrder.last_updated_by,
    lastUpdatedAt: dbWorkOrder.last_updated_at,
    timeEntries,
    inventoryItems
  };
};

// Find a work order by ID
export const findWorkOrderById = async (id: string): Promise<WorkOrder | undefined> => {
  try {
    // Get the work order from Supabase
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!workOrder) return undefined;
    
    // Fetch time entries for this work order
    const { data: timeEntries, error: timeError } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', id);
    
    if (timeError) throw timeError;
    
    // Format the time entries to match our application format
    const formattedTimeEntries: TimeEntry[] = (timeEntries || []).map((entry: any) => ({
      id: entry.id,
      employeeId: entry.employee_id,
      employeeName: entry.employee_name,
      startTime: entry.start_time,
      endTime: entry.end_time,
      duration: entry.duration,
      notes: entry.notes,
      billable: entry.billable
    }));
    
    // Fetch inventory items for this work order
    const { data: inventoryItems, error: invError } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', id);
    
    if (invError) throw invError;
    
    // Format the inventory items to match our application format
    const formattedInventoryItems: WorkOrderInventoryItem[] = (inventoryItems || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unit_price
    }));
    
    // Combine all data into the WorkOrder object
    return mapFromDbWorkOrder(workOrder, formattedTimeEntries, formattedInventoryItems);
  } catch (error) {
    handleApiError(error, "Error finding work order");
    return undefined;
  }
};

// Update a work order
export const updateWorkOrder = async (workOrder: WorkOrder): Promise<WorkOrder> => {
  try {
    // Extract time entries and inventory items
    const timeEntries = workOrder.timeEntries || [];
    const inventoryItems = workOrder.inventoryItems || [];
    
    // Map to database format
    const dbWorkOrder = mapToDbWorkOrder(workOrder);
    
    // Update the work order in Supabase
    const { data, error } = await supabase
      .from('work_orders')
      .update(dbWorkOrder)
      .eq('id', workOrder.id)
      .select()
      .single();
      
    if (error) throw error;
    
    // Handle time entries
    if (timeEntries.length > 0) {
      // First delete existing time entries
      const { error: deleteError } = await supabase
        .from('work_order_time_entries')
        .delete()
        .eq('work_order_id', workOrder.id);
        
      if (deleteError) throw deleteError;
      
      // Then insert the updated ones
      for (const entry of timeEntries) {
        const { error: insertError } = await supabase
          .from('work_order_time_entries')
          .insert({
            work_order_id: workOrder.id,
            employee_id: entry.employeeId,
            employee_name: entry.employeeName,
            start_time: entry.startTime,
            end_time: entry.endTime,
            duration: entry.duration,
            notes: entry.notes || null,
            billable: entry.billable
          });
        
        if (insertError) throw insertError;
      }
    }
    
    // Handle inventory items
    if (inventoryItems.length > 0) {
      // First delete existing inventory items
      const { error: deleteError } = await supabase
        .from('work_order_inventory_items')
        .delete()
        .eq('work_order_id', workOrder.id);
        
      if (deleteError) throw deleteError;
      
      // Then insert the updated ones
      for (const item of inventoryItems) {
        const { error: insertError } = await supabase
          .from('work_order_inventory_items')
          .insert({
            work_order_id: workOrder.id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            unit_price: item.unitPrice
          });
        
        if (insertError) throw insertError;
      }
    }
    
    // Record activity
    await recordWorkOrderActivity("Updated", workOrder.id, "system", workOrder.lastUpdatedBy || "System");
    
    return mapFromDbWorkOrder(data, timeEntries, inventoryItems);
  } catch (error) {
    const formattedError = handleApiError(error, "Failed to update work order");
    throw new Error(formattedError.message);
  }
};

// Delete a work order
export const deleteWorkOrder = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_orders')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    // Note: We don't need to delete time entries or inventory items manually
    // because we've set up ON DELETE CASCADE in the database
    
    // Record activity
    await recordWorkOrderActivity("Deleted", id, "system", "System", false);
  } catch (error) {
    const formattedError = handleApiError(error, "Failed to delete work order");
    throw new Error(formattedError.message);
  }
};

// Create a new work order
export const createWorkOrder = async (workOrderData: Omit<WorkOrder, "id" | "date">): Promise<WorkOrder> => {
  try {
    // Extract time entries and inventory items
    const timeEntries = workOrderData.timeEntries || [];
    const inventoryItems = workOrderData.inventoryItems || [];
    
    // Create DB format object
    const dbWorkOrder = mapToDbWorkOrder({
      ...workOrderData,
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    });
    
    // Create the work order in Supabase
    const { data, error } = await supabase
      .from('work_orders')
      .insert(dbWorkOrder)
      .select()
      .single();
      
    if (error) throw error;
    
    const workOrderId = data.id;
    
    // Handle time entries
    if (timeEntries.length > 0) {
      for (const entry of timeEntries) {
        const { error: insertError } = await supabase
          .from('work_order_time_entries')
          .insert({
            work_order_id: workOrderId,
            employee_id: entry.employeeId,
            employee_name: entry.employeeName,
            start_time: entry.startTime,
            end_time: entry.endTime,
            duration: entry.duration,
            notes: entry.notes || null,
            billable: entry.billable
          });
        
        if (insertError) throw insertError;
      }
    }
    
    // Handle inventory items
    if (inventoryItems.length > 0) {
      for (const item of inventoryItems) {
        const { error: insertError } = await supabase
          .from('work_order_inventory_items')
          .insert({
            work_order_id: workOrderId,
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            unit_price: item.unitPrice
          });
        
        if (insertError) throw insertError;
      }
    }
    
    // Record activity
    await recordWorkOrderActivity("Created", workOrderId, "system", workOrderData.createdBy || "System");
    
    // Return the complete work order
    return mapFromDbWorkOrder(data, timeEntries, inventoryItems);
  } catch (error) {
    const formattedError = handleApiError(error, "Failed to create work order");
    throw new Error(formattedError.message);
  }
};

// Format a date string (YYYY-MM-DD) to a more readable format
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString; // Fallback to original string if formatting fails
  }
};

// Create a new invoice from a work order (to be implemented)
export const createInvoiceFromWorkOrder = async (
  workOrderId: string,
  invoiceData: any
): Promise<any> => {
  // This function would be implemented later when integrating invoices with Supabase
  console.log("Creating invoice from work order:", workOrderId, invoiceData);
  return { id: `INV-${Date.now()}` };
};

// Pagination utilities
export const paginateData = <T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): T[] => {
  try {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  } catch (error) {
    console.error("Pagination error:", error);
    return []; // Return empty array as fallback
  }
};

export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  try {
    return Math.ceil(totalItems / itemsPerPage);
  } catch (error) {
    console.error("Error calculating total pages:", error);
    return 1; // Return minimum 1 page as fallback
  }
};

// Function to record work order activity in Supabase
export const recordWorkOrderActivity = async (
  action: string,
  workOrderId: string,
  userId: string,
  userName: string,
  showToast: boolean = true
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_order_activities')
      .insert({
        action,
        work_order_id: workOrderId,
        user_id: userId,
        user_name: userName
      });
      
    if (error) throw error;
    
    if (showToast) {
      toast({
        title: "Activity Recorded",
        description: `${action} work order ${workOrderId}`,
        variant: "success",
      });
    }
  } catch (error) {
    console.error("Error recording activity:", error);
  }
};
