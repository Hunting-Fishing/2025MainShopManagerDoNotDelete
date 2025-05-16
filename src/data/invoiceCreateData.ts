import { supabase } from "@/lib/supabase";
import { WorkOrder, WorkOrderPriorityType } from "@/types/workOrder";

// Function to fetch work orders that are ready for invoicing
export const getWorkOrdersForInvoicing = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        id, 
        customer_id,
        customer:customers(first_name, last_name),
        vehicle_id,
        vehicle_make,
        vehicle_model,
        status,
        description,
        total_cost,
        time_entries,
        created_at,
        due_date,
        technician:team(name),
        location,
        billable_time,
        updated_at
      `)
      .eq('status', 'completed');

    if (error) {
      console.error("Error fetching work orders for invoicing:", error);
      throw new Error(`Error fetching work orders: ${error.message}`);
    }

    // Transform the data to match the WorkOrder type
    return data.map(wo => ({
      id: wo.id,
      customer_id: wo.customer_id,
      customer_name: wo.customer?.first_name + ' ' + wo.customer?.last_name || "Unknown Customer",
      customer: wo.customer?.first_name + ' ' + wo.customer?.last_name || "Unknown Customer",
      vehicle_id: wo.vehicle_id,
      vehicle_info: `${wo.vehicle_make || ''} ${wo.vehicle_model || ''}`,
      status: wo.status,
      description: wo.description,
      total_cost: wo.total_cost,
      timeEntries: wo.time_entries || [],
      date: wo.created_at,
      dueDate: wo.due_date,
      priority: "medium" as WorkOrderPriorityType,
      technician: wo.technician?.name,
      location: wo.location || "Main Shop",
      totalBillableTime: wo.billable_time || 0,
      created_at: wo.created_at,
      updated_at: wo.updated_at
    })) as WorkOrder[];
  } catch (error: any) {
    console.error("Unexpected error fetching work orders for invoicing:", error);
    throw new Error(`Unexpected error fetching work orders: ${error.message}`);
  }
};
