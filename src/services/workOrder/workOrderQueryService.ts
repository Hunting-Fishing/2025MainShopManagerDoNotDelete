
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        profiles:technician_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching work orders:', error);
      throw error;
    }

    if (!data) {
      console.log('No work orders found');
      return [];
    }

    console.log(`Raw work orders data:`, data);

    // Transform the data to match our WorkOrder type
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      const technicianProfile = wo.profiles;

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
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
        customer_email: customer?.email,
        customer_phone: customer?.phone,
        
        // Vehicle information
        vehicle_make: vehicle?.make,
        vehicle_model: vehicle?.model,
        vehicle_year: vehicle?.year?.toString(),
        vehicle_vin: vehicle?.vin,
        vehicle_license_plate: vehicle?.license_plate,
        
        // Technician information
        technician: technicianProfile ? `${technicianProfile.first_name} ${technicianProfile.last_name}` : undefined,
        
        // Vehicle object for detailed views
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate
        } : undefined,
        
        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
        date: wo.created_at,
        dueDate: wo.end_time,
        due_date: wo.end_time
      };
    });

    console.log(`Processed ${workOrders.length} work orders`);
    return workOrders;
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw new Error('Failed to fetch work orders');
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    console.log('Fetching work order by ID:', id);
    
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
          state,
          postal_code
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
        profiles:technician_id (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Database error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('Work order not found:', id);
      return null;
    }

    console.log('Raw work order data:', data);

    // Load job lines for this work order
    const { data: jobLinesData, error: jobLinesError } = await supabase.rpc('get_work_order_job_lines', {
      work_order_id_param: id
    });

    if (jobLinesError) {
      console.error('Error loading job lines:', jobLinesError);
    }

    const jobLines = (jobLinesData || []).map((item: any) => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      estimatedHours: item.estimated_hours,
      laborRate: item.labor_rate,
      totalAmount: item.total_amount,
      status: item.status,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    console.log(`Loaded ${jobLines.length} job lines for work order ${id}`);

    // Transform the data to match our WorkOrder type
    const customer = data.customers;
    const vehicle = data.vehicles;
    const technicianProfile = data.profiles;

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
      customer_name: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
      customer_email: customer?.email,
      customer_phone: customer?.phone,
      customer_address: customer?.address,
      customer_city: customer?.city,
      customer_state: customer?.state,
      customer_zip: customer?.postal_code,
      
      // Vehicle information
      vehicle_make: vehicle?.make,
      vehicle_model: vehicle?.model,
      vehicle_year: vehicle?.year?.toString(),
      vehicle_vin: vehicle?.vin,
      vehicle_license_plate: vehicle?.license_plate,
      
      // Technician information
      technician: technicianProfile ? `${technicianProfile.first_name} ${technicianProfile.last_name}` : undefined,
      
      // Vehicle object for detailed views
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        license_plate: vehicle.license_plate,
        trim: vehicle.trim
      } : undefined,
      
      // Job lines
      jobLines,
      
      // Legacy fields for backward compatibility
      customer: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
      date: data.created_at,
      dueDate: data.end_time,
      due_date: data.end_time,
      
      // Initialize other arrays as empty for now
      timeEntries: [],
      inventoryItems: [],
      inventory_items: []
    };

    console.log('Processed work order:', workOrder);
    return workOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw new Error('Failed to fetch work order');
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        profiles:technician_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching work orders by customer:', error);
      throw error;
    }

    if (!data) {
      console.log('No work orders found for customer:', customerId);
      return [];
    }

    // Transform the data using the same logic as getAllWorkOrders
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      const technicianProfile = wo.profiles;

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
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
        customer_email: customer?.email,
        customer_phone: customer?.phone,
        
        // Vehicle information
        vehicle_make: vehicle?.make,
        vehicle_model: vehicle?.model,
        vehicle_year: vehicle?.year?.toString(),
        vehicle_vin: vehicle?.vin,
        vehicle_license_plate: vehicle?.license_plate,
        
        // Technician information
        technician: technicianProfile ? `${technicianProfile.first_name} ${technicianProfile.last_name}` : undefined,
        
        // Vehicle object for detailed views
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate
        } : undefined,
        
        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
        date: wo.created_at,
        dueDate: wo.end_time,
        due_date: wo.end_time
      };
    });

    console.log(`Found ${workOrders.length} work orders for customer ${customerId}`);
    return workOrders;
  } catch (error) {
    console.error('Error fetching work orders by customer:', error);
    throw new Error('Failed to fetch work orders by customer');
  }
}

export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders by status:', status);
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers:customer_id (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        profiles:technician_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching work orders by status:', error);
      throw error;
    }

    if (!data) {
      console.log('No work orders found with status:', status);
      return [];
    }

    // Transform the data using the same logic as getAllWorkOrders
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const customer = wo.customers;
      const vehicle = wo.vehicles;
      const technicianProfile = wo.profiles;

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
        customer_name: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
        customer_email: customer?.email,
        customer_phone: customer?.phone,
        
        // Vehicle information
        vehicle_make: vehicle?.make,
        vehicle_model: vehicle?.model,
        vehicle_year: vehicle?.year?.toString(),
        vehicle_vin: vehicle?.vin,
        vehicle_license_plate: vehicle?.license_plate,
        
        // Technician information
        technician: technicianProfile ? `${technicianProfile.first_name} ${technicianProfile.last_name}` : undefined,
        
        // Vehicle object for detailed views
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          vin: vehicle.vin,
          license_plate: vehicle.license_plate
        } : undefined,
        
        // Legacy fields for backward compatibility
        customer: customer ? `${customer.first_name} ${customer.last_name}` : undefined,
        date: wo.created_at,
        dueDate: wo.end_time,
        due_date: wo.end_time
      };
    });

    console.log(`Found ${workOrders.length} work orders with status ${status}`);
    return workOrders;
  } catch (error) {
    console.error('Error fetching work orders by status:', error);
    throw new Error('Failed to fetch work orders by status');
  }
}

export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    console.log('Fetching unique technicians...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        profiles:technician_id (
          id,
          first_name,
          last_name
        )
      `)
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Database error fetching technicians:', error);
      throw error;
    }

    if (!data) {
      console.log('No technicians found');
      return [];
    }

    // Extract unique technician names
    const technicianNames = new Set<string>();
    data.forEach((item: any) => {
      if (item.profiles) {
        const name = `${item.profiles.first_name} ${item.profiles.last_name}`;
        technicianNames.add(name);
      }
    });

    const uniqueTechnicians = Array.from(technicianNames);
    console.log(`Found ${uniqueTechnicians.length} unique technicians:`, uniqueTechnicians);
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error fetching unique technicians:', error);
    throw new Error('Failed to fetch unique technicians');
  }
}
