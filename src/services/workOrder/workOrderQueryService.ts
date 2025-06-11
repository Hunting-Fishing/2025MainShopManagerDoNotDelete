
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  const { data, error } = await supabase
    .from("work_orders")
    .select(`
      *,
      customers!inner(
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code
      ),
      vehicles(
        id,
        year,
        make,
        model,
        vin,
        license_plate,
        trim
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching work orders:", error);
    throw error;
  }

  return (data || []).map(workOrder => normalizeWorkOrderData(workOrder));
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  console.log('Fetching work order with ID:', id);
  
  const { data, error } = await supabase
    .from("work_orders")
    .select(`
      *,
      customers(
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code
      ),
      vehicles(
        id,
        year,
        make,
        model,
        vin,
        license_plate,
        trim
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching work order:", error);
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw error;
  }

  if (!data) {
    return null;
  }

  console.log('Raw work order data:', data);
  
  const normalizedData = normalizeWorkOrderData(data);
  console.log('Normalized work order data:', normalizedData);
  
  return normalizedData;
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  const { data, error } = await supabase
    .from("work_orders")
    .select(`
      *,
      customers(
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code
      ),
      vehicles(
        id,
        year,
        make,
        model,
        vin,
        license_plate,
        trim
      )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching work orders by customer ID:", error);
    throw error;
  }

  return (data || []).map(workOrder => normalizeWorkOrderData(workOrder));
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  const { data, error } = await supabase
    .from("work_orders")
    .select(`
      *,
      customers(
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        state,
        zip_code
      ),
      vehicles(
        id,
        year,
        make,
        model,
        vin,
        license_plate,
        trim
      )
    `)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching work orders by status:", error);
    throw error;
  }

  return (data || []).map(workOrder => normalizeWorkOrderData(workOrder));
};

export const getUniqueTechnicians = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from("work_orders")
    .select("technician_id")
    .not("technician_id", "is", null);

  if (error) {
    console.error("Error fetching unique technicians:", error);
    throw error;
  }

  // Extract unique technician IDs
  const uniqueTechnicians = [...new Set(data?.map(row => row.technician_id).filter(Boolean) || [])];
  return uniqueTechnicians;
};

// Helper function to normalize work order data from database
function normalizeWorkOrderData(dbWorkOrder: any): WorkOrder {
  const customer = dbWorkOrder.customers;
  const vehicle = dbWorkOrder.vehicles;
  
  console.log('Customer data:', customer);
  console.log('Vehicle data:', vehicle);
  
  return {
    id: dbWorkOrder.id,
    work_order_number: dbWorkOrder.work_order_number,
    customer_id: dbWorkOrder.customer_id,
    vehicle_id: dbWorkOrder.vehicle_id,
    advisor_id: dbWorkOrder.advisor_id,
    technician_id: dbWorkOrder.technician_id,
    estimated_hours: dbWorkOrder.estimated_hours,
    total_cost: dbWorkOrder.total_cost,
    created_by: dbWorkOrder.created_by,
    created_at: dbWorkOrder.created_at,
    updated_at: dbWorkOrder.updated_at,
    start_time: dbWorkOrder.start_time,
    end_time: dbWorkOrder.end_time,
    service_category_id: dbWorkOrder.service_category_id,
    invoiced_at: dbWorkOrder.invoiced_at,
    status: dbWorkOrder.status || 'pending',
    description: dbWorkOrder.description || '',
    service_type: dbWorkOrder.service_type,
    invoice_id: dbWorkOrder.invoice_id,
    
    // Customer information
    customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
    customer_email: customer?.email || '',
    customer_phone: customer?.phone || '',
    customer_address: customer ? [
      customer.address,
      customer.city,
      customer.state,
      customer.zip_code
    ].filter(Boolean).join(', ') : '',
    
    // Vehicle information
    vehicle_make: vehicle?.make || '',
    vehicle_model: vehicle?.model || '',
    vehicle_year: vehicle?.year?.toString() || '',
    vehicle_vin: vehicle?.vin || '',
    vehicle_license_plate: vehicle?.license_plate || '',
    
    // Backward compatibility fields
    customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
    technician: '', // This would need to be joined from a technicians table
    date: dbWorkOrder.created_at,
    dueDate: dbWorkOrder.end_time,
    due_date: dbWorkOrder.end_time,
    priority: 'medium', // Default since this field doesn't exist in the database
    location: '', // Default since this field doesn't exist in the database
    notes: dbWorkOrder.description || '',
    
    // Additional fields
    timeEntries: [],
    inventoryItems: [],
    inventory_items: [],
    vehicle: vehicle ? {
      id: vehicle.id,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      trim: vehicle.trim
    } : undefined
  };
}

export const getWorkOrderTimeEntries = async (workOrderId: string) => {
  const { data, error } = await supabase
    .from("work_order_time_entries")
    .select("*")
    .eq("work_order_id", workOrderId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching work order time entries:", error);
    throw error;
  }

  return data || [];
};
