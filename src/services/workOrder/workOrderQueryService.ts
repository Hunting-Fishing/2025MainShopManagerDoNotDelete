import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { loadJobLinesFromDatabase } from '@/services/jobLineDatabase';

/**
 * Get all work orders with related data using SQL joins
 */
export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('workOrderQueryService: Starting getAllWorkOrders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email),
        creator:profiles!work_orders_created_by_fkey(id, first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('workOrderQueryService: Error fetching work orders:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    if (!data) {
      console.log('workOrderQueryService: No data returned');
      return [];
    }

    console.log('workOrderQueryService: Raw data from Supabase:', data.length, 'records');

    // Transform and enrich the data
    const enrichedWorkOrders = await Promise.all(
      data.map(async (workOrder: any) => {
        // Load job lines for this work order
        let jobLines: any[] = [];
        try {
          jobLines = await loadJobLinesFromDatabase(workOrder.id);
          console.log(`workOrderQueryService: Loaded ${jobLines.length} job lines for work order ${workOrder.id}`);
        } catch (error) {
          console.error(`workOrderQueryService: Error loading job lines for work order ${workOrder.id}:`, error);
        }

        // Transform the work order data
        const transformedWorkOrder: WorkOrder = {
          id: workOrder.id,
          work_order_number: workOrder.work_order_number,
          customer_id: workOrder.customer_id,
          vehicle_id: workOrder.vehicle_id,
          advisor_id: workOrder.advisor_id,
          technician_id: workOrder.technician_id,
          estimated_hours: workOrder.estimated_hours,
          total_cost: workOrder.total_cost,
          created_by: workOrder.created_by,
          created_at: workOrder.created_at,
          updated_at: workOrder.updated_at,
          start_time: workOrder.start_time,
          end_time: workOrder.end_time,
          service_category_id: workOrder.service_category_id,
          invoiced_at: workOrder.invoiced_at,
          status: workOrder.status || 'pending',
          description: workOrder.description,
          service_type: workOrder.service_type,
          invoice_id: workOrder.invoice_id,
          
          // Customer information from joined data
          customer_name: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
          customer: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
          customer_email: workOrder.customers?.email || '',
          customer_phone: workOrder.customers?.phone || '',
          
          // Vehicle information from joined data
          vehicle_year: workOrder.vehicles?.year?.toString() || '',
          vehicle_make: workOrder.vehicles?.make || '',
          vehicle_model: workOrder.vehicles?.model || '',
          vehicle_vin: workOrder.vehicles?.vin || '',
          vehicle_license_plate: workOrder.vehicles?.license_plate || '',
          
          // Technician information from joined data
          technician: workOrder.technician ? `${workOrder.technician.first_name || ''} ${workOrder.technician.last_name || ''}`.trim() : '',
          
          // Set additional UI fields
          date: workOrder.created_at,
          dueDate: workOrder.end_time || workOrder.created_at,
          due_date: workOrder.end_time || workOrder.created_at,
          priority: 'medium', // Default priority
          location: '', // Default location
          notes: workOrder.description || '',
          
          // Add job lines
          jobLines: jobLines,
          
          // Vehicle object for consistency
          vehicle: workOrder.vehicles ? {
            id: workOrder.vehicles.id,
            year: workOrder.vehicles.year,
            make: workOrder.vehicles.make,
            model: workOrder.vehicles.model,
            vin: workOrder.vehicles.vin,
            license_plate: workOrder.vehicles.license_plate
          } : undefined
        };

        return transformedWorkOrder;
      })
    );

    console.log('workOrderQueryService: Successfully transformed', enrichedWorkOrders.length, 'work orders');
    return enrichedWorkOrders;

  } catch (error) {
    console.error('workOrderQueryService: Error in getAllWorkOrders:', error);
    throw error;
  }
}

/**
 * Get work order by ID with related data
 */
export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    console.log('workOrderQueryService: Starting getWorkOrderById for ID:', id);

    if (!id || id === 'undefined') {
      console.error('workOrderQueryService: Invalid work order ID provided:', id);
      throw new Error('Invalid work order ID');
    }

    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email),
        creator:profiles!work_orders_created_by_fkey(id, first_name, last_name, email)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('workOrderQueryService: Error fetching work order:', error);
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    if (!data) {
      console.log('workOrderQueryService: No work order found with ID:', id);
      return null;
    }

    console.log('workOrderQueryService: Found work order:', data);

    // Load job lines for this work order
    let jobLines: any[] = [];
    try {
      jobLines = await loadJobLinesFromDatabase(data.id);
      console.log(`workOrderQueryService: Loaded ${jobLines.length} job lines for work order ${data.id}`);
    } catch (error) {
      console.error(`workOrderQueryService: Error loading job lines for work order ${data.id}:`, error);
    }

    // Transform the work order data
    const transformedWorkOrder: WorkOrder = {
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
      status: data.status || 'pending',
      description: data.description,
      service_type: data.service_type,
      invoice_id: data.invoice_id,
      
      // Customer information from joined data
      customer_name: data.customers ? `${data.customers.first_name || ''} ${data.customers.last_name || ''}`.trim() : '',
      customer: data.customers ? `${data.customers.first_name || ''} ${data.customers.last_name || ''}`.trim() : '',
      customer_email: data.customers?.email || '',
      customer_phone: data.customers?.phone || '',
      
      // Vehicle information from joined data
      vehicle_year: data.vehicles?.year?.toString() || '',
      vehicle_make: data.vehicles?.make || '',
      vehicle_model: data.vehicles?.model || '',
      vehicle_vin: data.vehicles?.vin || '',
      vehicle_license_plate: data.vehicles?.license_plate || '',
      
      // Technician information from joined data
      technician: data.technician ? `${data.technician.first_name || ''} ${data.technician.last_name || ''}`.trim() : '',
      
      // Set additional UI fields
      date: data.created_at,
      dueDate: data.end_time || data.created_at,
      due_date: data.end_time || data.created_at,
      priority: 'medium', // Default priority
      location: '', // Default location
      notes: data.description || '',
      
      // Add job lines
      jobLines: jobLines,
      
      // Vehicle object for consistency
      vehicle: data.vehicles ? {
        id: data.vehicles.id,
        year: data.vehicles.year,
        make: data.vehicles.make,
        model: data.vehicles.model,
        vin: data.vehicles.vin,
        license_plate: data.vehicles.license_plate
      } : undefined
    };

    console.log('workOrderQueryService: Successfully transformed work order:', transformedWorkOrder.id);
    return transformedWorkOrder;

  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrderById:', error);
    throw error;
  }
}

/**
 * Get work orders by customer ID
 */
export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log('workOrderQueryService: Starting getWorkOrdersByCustomerId for customer:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email),
        creator:profiles!work_orders_created_by_fkey(id, first_name, last_name, email)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('workOrderQueryService: Error fetching work orders for customer:', error);
      throw new Error(`Failed to fetch work orders for customer: ${error.message}`);
    }

    if (!data) {
      console.log('workOrderQueryService: No data returned');
      return [];
    }

    console.log('workOrderQueryService: Raw data from Supabase:', data.length, 'records');

    // Transform and enrich the data
    const enrichedWorkOrders = await Promise.all(
      data.map(async (workOrder: any) => {
        // Load job lines for this work order
        let jobLines: any[] = [];
        try {
          jobLines = await loadJobLinesFromDatabase(workOrder.id);
          console.log(`workOrderQueryService: Loaded ${jobLines.length} job lines for work order ${workOrder.id}`);
        } catch (error) {
          console.error(`workOrderQueryService: Error loading job lines for work order ${workOrder.id}:`, error);
        }

        // Transform the work order data
        const transformedWorkOrder: WorkOrder = {
          id: workOrder.id,
          work_order_number: workOrder.work_order_number,
          customer_id: workOrder.customer_id,
          vehicle_id: workOrder.vehicle_id,
          advisor_id: workOrder.advisor_id,
          technician_id: workOrder.technician_id,
          estimated_hours: workOrder.estimated_hours,
          total_cost: workOrder.total_cost,
          created_by: workOrder.created_by,
          created_at: workOrder.created_at,
          updated_at: workOrder.updated_at,
          start_time: workOrder.start_time,
          end_time: workOrder.end_time,
          service_category_id: workOrder.service_category_id,
          invoiced_at: workOrder.invoiced_at,
          status: workOrder.status || 'pending',
          description: workOrder.description,
          service_type: workOrder.service_type,
          invoice_id: workOrder.invoice_id,
          
          // Customer information from joined data
          customer_name: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
          customer: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
          customer_email: workOrder.customers?.email || '',
          customer_phone: workOrder.customers?.phone || '',
          
          // Vehicle information from joined data
          vehicle_year: workOrder.vehicles?.year?.toString() || '',
          vehicle_make: workOrder.vehicles?.make || '',
          vehicle_model: workOrder.vehicles?.model || '',
          vehicle_vin: workOrder.vehicles?.vin || '',
          vehicle_license_plate: workOrder.vehicles?.license_plate || '',
          
          // Technician information from joined data
          technician: workOrder.technician ? `${workOrder.technician.first_name || ''} ${workOrder.technician.last_name || ''}`.trim() : '',
          
          // Set additional UI fields
          date: workOrder.created_at,
          dueDate: workOrder.end_time || workOrder.created_at,
          due_date: workOrder.end_time || workOrder.created_at,
          priority: 'medium', // Default priority
          location: '', // Default location
          notes: workOrder.description || '',
          
          // Add job lines
          jobLines: jobLines,
          
          // Vehicle object for consistency
          vehicle: workOrder.vehicles ? {
            id: workOrder.vehicles.id,
            year: workOrder.vehicles.year,
            make: workOrder.vehicles.make,
            model: workOrder.vehicles.model,
            vin: workOrder.vehicles.vin,
            license_plate: workOrder.vehicles.license_plate
          } : undefined
        };

        return transformedWorkOrder;
      })
    );

    console.log('workOrderQueryService: Successfully transformed', enrichedWorkOrders.length, 'work orders');
    return enrichedWorkOrders;

  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
}

/**
 * Get work orders by status
 */
export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    console.log('workOrderQueryService: Starting getWorkOrdersByStatus for status:', status);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate),
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        advisor:profiles!work_orders_advisor_id_fkey(id, first_name, last_name, email),
        creator:profiles!work_orders_created_by_fkey(id, first_name, last_name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('workOrderQueryService: Error fetching work orders by status:', error);
      throw new Error(`Failed to fetch work orders by status: ${error.message}`);
    }

    if (!data) {
      console.log('workOrderQueryService: No data returned');
      return [];
    }

    console.log('workOrderQueryService: Raw data from Supabase:', data.length, 'records');

    // Transform and enrich the data
    const enrichedWorkOrders = await Promise.all(
      data.map(async (workOrder: any) => {
        // Load job lines for this work order
        let jobLines: any[] = [];
        try {
          jobLines = await loadJobLinesFromDatabase(workOrder.id);
          console.log(`workOrderQueryService: Loaded ${jobLines.length} job lines for work order ${workOrder.id}`);
        } catch (error) {
          console.error(`workOrderQueryService: Error loading job lines for work order ${workOrder.id}:`, error);
        }

        // Transform the work order data
        const transformedWorkOrder: WorkOrder = {
          id: workOrder.id,
          work_order_number: workOrder.work_order_number,
          customer_id: workOrder.customer_id,
          vehicle_id: workOrder.vehicle_id,
          advisor_id: workOrder.advisor_id,
          technician_id: workOrder.technician_id,
          estimated_hours: workOrder.estimated_hours,
          total_cost: workOrder.total_cost,
          created_by: workOrder.created_by,
          created_at: workOrder.created_at,
          updated_at: workOrder.updated_at,
          start_time: workOrder.start_time,
          end_time: workOrder.end_time,
          service_category_id: workOrder.service_category_id,
          invoiced_at: workOrder.invoiced_at,
          status: workOrder.status || 'pending',
          description: workOrder.description,
          service_type: workOrder.service_type,
          invoice_id: workOrder.invoice_id,
          
          // Customer information from joined data
          customer_name: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
          customer: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
          customer_email: workOrder.customers?.email || '',
          customer_phone: workOrder.customers?.phone || '',
          
          // Vehicle information from joined data
          vehicle_year: workOrder.vehicles?.year?.toString() || '',
          vehicle_make: workOrder.vehicles?.make || '',
          vehicle_model: workOrder.vehicles?.model || '',
          vehicle_vin: workOrder.vehicles?.vin || '',
          vehicle_license_plate: workOrder.vehicles?.license_plate || '',
          
          // Technician information from joined data
          technician: workOrder.technician ? `${workOrder.technician.first_name || ''} ${workOrder.technician.last_name || ''}`.trim() : '',
          
          // Set additional UI fields
          date: workOrder.created_at,
          dueDate: workOrder.end_time || workOrder.created_at,
          due_date: workOrder.end_time || workOrder.created_at,
          priority: 'medium', // Default priority
          location: '', // Default location
          notes: workOrder.description || '',
          
          // Add job lines
          jobLines: jobLines,
          
          // Vehicle object for consistency
          vehicle: workOrder.vehicles ? {
            id: workOrder.vehicles.id,
            year: workOrder.vehicles.year,
            make: workOrder.vehicles.make,
            model: workOrder.vehicles.model,
            vin: workOrder.vehicles.vin,
            license_plate: workOrder.vehicles.license_plate
          } : undefined
        };

        return transformedWorkOrder;
      })
    );

    console.log('workOrderQueryService: Successfully transformed', enrichedWorkOrders.length, 'work orders');
    return enrichedWorkOrders;

  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrdersByStatus:', error);
    throw error;
  }
}

/**
 * Get unique technicians from work orders
 */
export async function getUniqueTechnicians(): Promise<{ id: string; name: string }[]> {
  try {
    console.log('workOrderQueryService: Starting getUniqueTechnicians...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        technician_id,
        technician:profiles!work_orders_technician_id_fkey(id, first_name, last_name)
      `)
      .not('technician_id', 'is', null);

    if (error) {
      console.error('workOrderQueryService: Error fetching technicians:', error);
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }

    if (!data) {
      console.log('workOrderQueryService: No data returned');
      return [];
    }

    // Create a map to ensure uniqueness
    const techMap = new Map<string, { id: string; name: string }>();
    
    data.forEach((item: any) => {
      if (item.technician && item.technician_id) {
        const name = `${item.technician.first_name || ''} ${item.technician.last_name || ''}`.trim();
        if (name && !techMap.has(item.technician_id)) {
          techMap.set(item.technician_id, {
            id: item.technician_id,
            name: name
          });
        }
      }
    });

    const technicians = Array.from(techMap.values());
    console.log('workOrderQueryService: Successfully transformed', technicians.length, 'technicians');
    return technicians;

  } catch (error) {
    console.error('workOrderQueryService: Error in getUniqueTechnicians:', error);
    throw error;
  }
}
