
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";
import { mapDatabaseToAppModel } from "../mappers";

export async function findWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        work_order_time_entries(*)
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error finding work order:", error);
      return null;
    }
    
    if (!data) return null;
    
    // Fetch customer data separately
    let customerData = null;
    if (data.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('first_name, last_name')
        .eq('id', data.customer_id)
        .single();
      customerData = customer;
    }
    
    // Fetch technician data separately
    let technicianData = null;
    if (data.technician_id) {
      const { data: technician } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', data.technician_id)
        .single();
      technicianData = technician;
    }
    
    // Combine all the data
    const workOrderWithRelations = {
      ...data,
      customers: customerData,
      profiles: technicianData
    };
    
    return mapDatabaseToAppModel(workOrderWithRelations) as WorkOrder;
  } catch (err) {
    console.error("Error in findWorkOrderById:", err);
    return null;
  }
}
