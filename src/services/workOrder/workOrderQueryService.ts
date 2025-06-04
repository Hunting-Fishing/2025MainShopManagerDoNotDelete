
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder } from "@/types/workOrder";

/**
 * Get all work orders with related data
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getAllWorkOrders: Fetching all work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        technician:technician_id (
          id,
          first_name,
          last_name,
          email
        ),
        work_order_job_lines (
          id,
          name,
          category,
          subcategory,
          description,
          estimated_hours,
          labor_rate,
          total_amount,
          status,
          notes,
          display_order,
          created_at,
          updated_at,
          work_order_id
        ),
        work_order_inventory_items (
          id,
          name,
          sku,
          category,
          quantity,
          unit_price,
          work_order_id,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllWorkOrders: Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('getAllWorkOrders: No work orders found');
      return [];
    }

    console.log(`getAllWorkOrders: Found ${data.length} work orders`);

    // Transform the data to match the WorkOrder interface
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      const technician = wo.technician;

      return {
        id: wo.id,
        work_order_number: wo.work_order_number,
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        advisor_id: wo.advisor_id,
        technician_id: wo.technician_id,
        estimated_hours: wo.estimated_hours,
        total_cost: wo.total_cost,
        created_by: wo.created_by,
        created_at: wo.created_at,
        updated_at: wo.updated_at,
        start_time: wo.start_time,
        end_time: wo.end_time,
        service_category_id: wo.service_category_id,
        invoiced_at: wo.invoiced_at,
        status: wo.status,
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        
        // Customer information
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        
        // Vehicle information
        vehicle: vehicle,
        vehicle_year: vehicle?.year ? String(vehicle.year) : '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Technician information
        technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
        
        // Job lines with proper mapping
        jobLines: wo.work_order_job_lines?.map((jl: any) => ({
          ...jl,
          createdAt: jl.created_at,
          updatedAt: jl.updated_at
        })) || [],
        
        // Inventory items with calculated total
        inventoryItems: wo.work_order_inventory_items?.map((item: any) => ({
          ...item,
          total: (item.quantity || 0) * (item.unit_price || 0)
        })) || [],
        inventory_items: wo.work_order_inventory_items?.map((item: any) => ({
          ...item,
          total: (item.quantity || 0) * (item.unit_price || 0)
        })) || []
      };
    });

    return workOrders;
  } catch (error) {
    console.error('getAllWorkOrders: Error fetching work orders:', error);
    throw error;
  }
};

/**
 * Get a single work order by ID with all related data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('getWorkOrderById: Fetching work order:', id);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        technician:technician_id (
          id,
          first_name,
          last_name,
          email
        ),
        work_order_job_lines (
          id,
          name,
          category,
          subcategory,
          description,
          estimated_hours,
          labor_rate,
          total_amount,
          status,
          notes,
          display_order,
          created_at,
          updated_at,
          work_order_id
        ),
        work_order_inventory_items (
          id,
          name,
          sku,
          category,
          quantity,
          unit_price,
          work_order_id,
          created_at
        ),
        work_order_time_entries (
          id,
          employee_id,
          employee_name,
          start_time,
          end_time,
          duration,
          billable,
          notes,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('getWorkOrderById: Supabase error:', error);
      throw error;
    }

    if (!data) {
      console.log('getWorkOrderById: Work order not found');
      return null;
    }

    console.log('getWorkOrderById: Work order found:', data);

    const customer = data.customers;
    const vehicle = data.vehicles;
    const technician = data.technician;

    // Transform the data to match the WorkOrder interface
    const workOrder: WorkOrder = {
      id: data.id,
      work_order_number: data.work_order_number,
      customer_id: data.customer_id,
      vehicle_id: data.vehicle_id,
      advisor_id: data.advisor_id,
      technician_id: data.technician_id,
      estimated_hours: data.estimated_hours,
      total_cost: data.total_cost,
      created_by: data.created_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      start_time: data.start_time,
      end_time: data.end_time,
      service_category_id: data.service_category_id,
      invoiced_at: data.invoiced_at,
      status: data.status,
      description: data.description,
      service_type: data.service_type,
      invoice_id: data.invoice_id,
      
      // Customer information
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      
      // Vehicle information
      vehicle: vehicle,
      vehicle_year: vehicle?.year ? String(vehicle.year) : '',
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      
      // Technician information
      technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
      
      // Job lines with proper mapping
      jobLines: data.work_order_job_lines?.map((jl: any) => ({
        ...jl,
        createdAt: jl.created_at,
        updatedAt: jl.updated_at
      })) || [],
      
      // Inventory items with calculated total
      inventoryItems: data.work_order_inventory_items?.map((item: any) => ({
        ...item,
        total: (item.quantity || 0) * (item.unit_price || 0)
      })) || [],
      inventory_items: data.work_order_inventory_items?.map((item: any) => ({
        ...item,
        total: (item.quantity || 0) * (item.unit_price || 0)
      })) || [],
      
      // Time entries
      timeEntries: data.work_order_time_entries || []
    };

    return workOrder;
  } catch (error) {
    console.error('getWorkOrderById: Error fetching work order:', error);
    throw error;
  }
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByCustomerId: Fetching work orders for customer:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        technician:technician_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByCustomerId: Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('getWorkOrdersByCustomerId: No work orders found for customer');
      return [];
    }

    console.log(`getWorkOrdersByCustomerId: Found ${data.length} work orders for customer`);

    // Transform the data to match the WorkOrder interface
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      const technician = wo.technician;

      return {
        id: wo.id,
        work_order_number: wo.work_order_number,
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        advisor_id: wo.advisor_id,
        technician_id: wo.technician_id,
        estimated_hours: wo.estimated_hours,
        total_cost: wo.total_cost,
        created_by: wo.created_by,
        created_at: wo.created_at,
        updated_at: wo.updated_at,
        start_time: wo.start_time,
        end_time: wo.end_time,
        service_category_id: wo.service_category_id,
        invoiced_at: wo.invoiced_at,
        status: wo.status,
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        
        // Customer information
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        
        // Vehicle information
        vehicle: vehicle,
        vehicle_year: vehicle?.year ? String(vehicle.year) : '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Technician information
        technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : ''
      };
    });

    return workOrders;
  } catch (error) {
    console.error('getWorkOrdersByCustomerId: Error fetching work orders:', error);
    throw error;
  }
};

/**
 * Get work orders by status
 */
export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByStatus: Fetching work orders with status:', status);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        technician:technician_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByStatus: Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('getWorkOrdersByStatus: No work orders found with status');
      return [];
    }

    console.log(`getWorkOrdersByStatus: Found ${data.length} work orders with status`);

    // Transform the data to match the WorkOrder interface
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      const technician = wo.technician;

      return {
        id: wo.id,
        work_order_number: wo.work_order_number,
        customer_id: wo.customer_id,
        vehicle_id: wo.vehicle_id,
        advisor_id: wo.advisor_id,
        technician_id: wo.technician_id,
        estimated_hours: wo.estimated_hours,
        total_cost: wo.total_cost,
        created_by: wo.created_by,
        created_at: wo.created_at,
        updated_at: wo.updated_at,
        start_time: wo.start_time,
        end_time: wo.end_time,
        service_category_id: wo.service_category_id,
        invoiced_at: wo.invoiced_at,
        status: wo.status,
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        
        // Customer information
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        
        // Vehicle information
        vehicle: vehicle,
        vehicle_year: vehicle?.year ? String(vehicle.year) : '',
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Technician information
        technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : ''
      };
    });

    return workOrders;
  } catch (error) {
    console.error('getWorkOrdersByStatus: Error fetching work orders:', error);
    throw error;
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    console.log('getUniqueTechnicians: Fetching unique technicians...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        technician:technician_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .not('technician_id', 'is', null);

    if (error) {
      console.error('getUniqueTechnicians: Supabase error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('getUniqueTechnicians: No technicians found');
      return [];
    }

    console.log(`getUniqueTechnicians: Found ${data.length} technician assignments`);

    // Extract unique technicians
    const technicianSet = new Set<string>();
    
    data.forEach((wo: any) => {
      const technician = wo.technician;
      if (technician) {
        const technicianName = `${technician.first_name || ''} ${technician.last_name || ''}`.trim();
        if (technicianName) {
          technicianSet.add(technicianName);
        }
      }
    });

    const uniqueTechnicians = Array.from(technicianSet);
    console.log('getUniqueTechnicians: Unique technicians:', uniqueTechnicians);

    return uniqueTechnicians;
  } catch (error) {
    console.error('getUniqueTechnicians: Error fetching technicians:', error);
    throw error;
  }
};
