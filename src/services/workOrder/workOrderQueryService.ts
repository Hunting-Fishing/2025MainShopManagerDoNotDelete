
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

// Get all work orders with customer and vehicle information
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders...');

    // First, get all work orders
    const { data: workOrdersData, error: workOrdersError } = await supabase
      .from("work_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (workOrdersError) {
      console.error("Error fetching work orders:", workOrdersError);
      throw workOrdersError;
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log('No work orders found');
      return [];
    }

    // Get unique customer IDs
    const customerIds = [...new Set(workOrdersData
      .map(wo => wo.customer_id)
      .filter(Boolean))] as string[];

    // Get unique vehicle IDs
    const vehicleIds = [...new Set(workOrdersData
      .map(wo => wo.vehicle_id)
      .filter(Boolean))] as string[];

    // Fetch customers
    let customersMap = new Map();
    if (customerIds.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .in("id", customerIds);

      if (customersError) {
        console.error("Error fetching customers:", customersError);
      } else {
        customersData?.forEach(customer => {
          customersMap.set(customer.id, customer);
        });
      }
    }

    // Fetch vehicles
    let vehiclesMap = new Map();
    if (vehicleIds.length > 0) {
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*")
        .in("id", vehicleIds);

      if (vehiclesError) {
        console.error("Error fetching vehicles:", vehiclesError);
      } else {
        vehiclesData?.forEach(vehicle => {
          vehiclesMap.set(vehicle.id, vehicle);
        });
      }
    }

    // Transform and combine data
    const transformedWorkOrders: WorkOrder[] = workOrdersData.map((workOrder) => {
      const customer = customersMap.get(workOrder.customer_id);
      const vehicle = vehiclesMap.get(workOrder.vehicle_id);

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer_zip: customer?.zip || '',
        
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Vehicle object for UI components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy properties for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        technician: '', // Would need to fetch from profiles table
        date: workOrder.created_at,
        dueDate: workOrder.end_time || '',
        due_date: workOrder.end_time || '',
        priority: 'medium', // Default since not in database
        location: '', // Would need to add to schema
        notes: workOrder.description || '',
        total_billable_time: 0, // Would need to calculate from time entries
        
        // Initialize arrays
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        jobLines: []
      } as WorkOrder;
    });

    console.log(`Successfully fetched ${transformedWorkOrders.length} work orders`);
    return transformedWorkOrders;

  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

// Get work order by ID
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order by ID:', id);

    const { data: workOrderData, error: workOrderError } = await supabase
      .from("work_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (workOrderError) {
      console.error("Error fetching work order:", workOrderError);
      if (workOrderError.code === 'PGRST116') {
        return null; // Not found
      }
      throw workOrderError;
    }

    if (!workOrderData) {
      return null;
    }

    // Fetch customer if exists
    let customer = null;
    if (workOrderData.customer_id) {
      const { data: customerData } = await supabase
        .from("customers")
        .select("*")
        .eq("id", workOrderData.customer_id)
        .single();
      customer = customerData;
    }

    // Fetch vehicle if exists
    let vehicle = null;
    if (workOrderData.vehicle_id) {
      const { data: vehicleData } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", workOrderData.vehicle_id)
        .single();
      vehicle = vehicleData;
    }

    // Transform the data
    const transformedWorkOrder: WorkOrder = {
      ...workOrderData,
      // Customer information
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      customer_zip: customer?.zip || '',
      
      // Vehicle information
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      
      // Vehicle object for UI components
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim
      } : undefined,

      // Legacy properties for backward compatibility
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      technician: '', // Would need to fetch from profiles table
      date: workOrderData.created_at,
      dueDate: workOrderData.end_time || '',
      due_date: workOrderData.end_time || '',
      priority: 'medium', // Default since not in database
      location: '', // Would need to add to schema
      notes: workOrderData.description || '',
      total_billable_time: 0, // Would need to calculate from time entries
      
      // Initialize arrays
      timeEntries: [],
      inventoryItems: [],
      inventory_items: [],
      jobLines: []
    };

    console.log('Successfully fetched work order:', transformedWorkOrder);
    return transformedWorkOrder;

  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

// Get work orders by customer ID
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders for customer:', customerId);

    const { data: workOrdersData, error } = await supabase
      .from("work_orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching work orders by customer ID:", error);
      throw error;
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      return [];
    }

    // Get customer info
    const { data: customerData } = await supabase
      .from("customers")
      .select("*")
      .eq("id", customerId)
      .single();

    // Get vehicle info for all work orders
    const vehicleIds = [...new Set(workOrdersData
      .map(wo => wo.vehicle_id)
      .filter(Boolean))] as string[];

    let vehiclesMap = new Map();
    if (vehicleIds.length > 0) {
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("*")
        .in("id", vehicleIds);

      vehiclesData?.forEach(vehicle => {
        vehiclesMap.set(vehicle.id, vehicle);
      });
    }

    // Transform data
    const transformedWorkOrders: WorkOrder[] = workOrdersData.map((workOrder) => {
      const vehicle = vehiclesMap.get(workOrder.vehicle_id);

      return {
        ...workOrder,
        // Customer information
        customer_name: customerData ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() : '',
        customer_email: customerData?.email || '',
        customer_phone: customerData?.phone || '',
        customer_address: customerData?.address || '',
        customer_city: customerData?.city || '',
        customer_state: customerData?.state || '',
        customer_zip: customerData?.zip || '',
        
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Vehicle object for UI components
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate,
          trim: vehicle.trim
        } : undefined,

        // Legacy properties for backward compatibility
        customer: customerData ? `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() : '',
        technician: '', // Would need to fetch from profiles table
        date: workOrder.created_at,
        dueDate: workOrder.end_time || '',
        due_date: workOrder.end_time || '',
        priority: 'medium', // Default since not in database
        location: '', // Would need to add to schema
        notes: workOrder.description || '',
        total_billable_time: 0, // Would need to calculate from time entries
        
        // Initialize arrays
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        jobLines: []
      } as WorkOrder;
    });

    console.log(`Successfully fetched ${transformedWorkOrders.length} work orders for customer`);
    return transformedWorkOrders;

  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

// Get work orders by status
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders by status:', status);

    const { data: workOrdersData, error } = await supabase
      .from("work_orders")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching work orders by status:", error);
      throw error;
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      return [];
    }

    // Get unique customer and vehicle IDs
    const customerIds = [...new Set(workOrdersData
      .map(wo => wo.customer_id)
      .filter(Boolean))] as string[];

    const vehicleIds = [...new Set(workOrdersData
      .map(wo => wo.vehicle_id)
      .filter(Boolean))] as string[];

    // Fetch customers and vehicles
    let customersMap = new Map();
    let vehiclesMap = new Map();

    if (customerIds.length > 0) {
      const { data: customersData } = await supabase
        .from("customers")
        .select("*")
        .in("id", customerIds);

      customersData?.forEach(customer => {
        customersMap.set(customer.id, customer);
      });
    }

    if (vehicleIds.length > 0) {
      const { data: vehiclesData } = await supabase
        .from("vehicles")
        .select("*")
        .in("id", vehicleIds);

      vehiclesData?.forEach(vehicle => {
        vehiclesMap.set(vehicle.id, vehicle);
      });
    }

    // Transform data
    const transformedWorkOrders: WorkOrder[] = workOrdersData.map((workOrder) => {
      const customer = customersMap.get(workOrder.customer_id);
      const vehicle = vehiclesMap.get(workOrder.vehicle_id);

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        
        // Vehicle information
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Legacy properties for backward compatibility
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        technician: '',
        date: workOrder.created_at,
        dueDate: workOrder.end_time || '',
        due_date: workOrder.end_time || '',
        priority: 'medium', // Default since not in database
        location: '',
        notes: workOrder.description || '',
        total_billable_time: 0,
        
        // Initialize arrays
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        jobLines: []
      } as WorkOrder;
    });

    console.log(`Successfully fetched ${transformedWorkOrders.length} work orders with status: ${status}`);
    return transformedWorkOrders;

  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

// Get unique technicians from work orders
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("work_orders")
      .select("technician_id")
      .not("technician_id", "is", null);

    if (error) {
      console.error("Error fetching technicians:", error);
      throw error;
    }

    const uniqueTechnicians = [...new Set(data?.map(wo => wo.technician_id).filter(Boolean))];
    return uniqueTechnicians as string[];

  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw error;
  }
};

// Get work order time entries
export const getWorkOrderTimeEntries = async (workOrderId: string) => {
  try {
    console.log('Fetching time entries for work order:', workOrderId);

    const { data, error } = await supabase
      .from("work_order_time_entries")
      .select("*")
      .eq("work_order_id", workOrderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching time entries:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} time entries`);
    return data || [];

  } catch (error) {
    console.error('Error in getWorkOrderTimeEntries:', error);
    throw error;
  }
};
