
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';
import { normalizeWorkOrder } from '@/utils/workOrders/formatters';

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state,
          zip
        ),
        profiles (
          id,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getAllWorkOrders:', error);
      throw error;
    }

    if (!data) {
      console.log('No work orders found');
      return [];
    }

    console.log('Raw work orders data:', data);

    // Map the data to WorkOrder format
    const workOrders: WorkOrder[] = data.map((workOrder: any) => {
      // Get the first vehicle if it's an array, or use the vehicle directly
      const vehicle = Array.isArray(workOrder.vehicles) ? workOrder.vehicles[0] : workOrder.vehicles;
      const customer = Array.isArray(workOrder.customers) ? workOrder.customers[0] : workOrder.customers;
      const technician = Array.isArray(workOrder.profiles) ? workOrder.profiles[0] : workOrder.profiles;

      return {
        id: workOrder.id,
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
        description: workOrder.description || '',
        service_type: workOrder.service_type,
        invoice_id: workOrder.invoice_id,
        
        // Backward compatibility fields
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer' : 'Unknown Customer',
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
        customer_email: customer?.email,
        customer_phone: customer?.phone,
        customer_address: customer?.address,
        technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : undefined,
        date: workOrder.created_at,
        dueDate: workOrder.end_time,
        due_date: workOrder.end_time,
        priority: 'medium', // Default priority since it's not in the database
        location: '', // Default location since it's not in the database
        notes: workOrder.description || '',
        
        // Vehicle information from individual fields (fallback)
        vehicle_make: vehicle?.make,
        vehicle_model: vehicle?.model,
        vehicle_year: vehicle?.year?.toString(),
        vehicle_vin: vehicle?.vin,
        vehicle_license_plate: vehicle?.license_plate,
        vehicle_odometer: undefined, // Not available in current schema
        
        // Additional fields
        timeEntries: [],
        inventoryItems: [],
        inventory_items: [],
        
        // NEW: Vehicle object from vehicle table join
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
    });

    console.log('Processed work orders:', workOrders);
    return workOrders;
  } catch (error: any) {
    console.error('Error fetching work orders:', error);
    throw new Error(error.message || 'Failed to fetch work orders');
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder | null> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        customers (
          id,
          first_name,
          last_name,
          email,
          phone,
          address
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    // Get the first vehicle if it's an array, or use the vehicle directly
    const vehicle = Array.isArray(data.vehicles) ? data.vehicles[0] : data.vehicles;
    const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers;

    return {
      id: data.id,
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
      description: data.description || '',
      service_type: data.service_type,
      invoice_id: data.invoice_id,
      
      // Backward compatibility fields
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown Customer' : 'Unknown Customer',
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : undefined,
      customer_email: customer?.email,
      customer_phone: customer?.phone,
      customer_address: customer?.address,
      technician: undefined,
      date: data.created_at,
      dueDate: data.end_time,
      due_date: data.end_time,
      priority: 'medium',
      location: '',
      notes: data.description || '',
      
      // Vehicle information
      vehicle_make: vehicle?.make,
      vehicle_model: vehicle?.model,
      vehicle_year: vehicle?.year?.toString(),
      vehicle_vin: vehicle?.vin,
      vehicle_license_plate: vehicle?.license_plate,
      
      // Additional fields
      timeEntries: [],
      inventoryItems: [],
      inventory_items: [],
      
      // Vehicle object from vehicle table join
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
  } catch (error: any) {
    console.error('Error fetching work order by ID:', error);
    throw new Error(error.message || 'Failed to fetch work order');
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(normalizeWorkOrder);
  } catch (error: any) {
    console.error('Error fetching work orders by customer ID:', error);
    throw new Error(error.message || 'Failed to fetch work orders');
  }
}

export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(normalizeWorkOrder);
  } catch (error: any) {
    console.error('Error fetching work orders by status:', error);
    throw new Error(error.message || 'Failed to fetch work orders');
  }
}

export async function getUniqueTechnicians(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id, profiles(first_name, last_name)')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching unique technicians:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Extract unique technician names
    const uniqueTechnicians = new Set<string>();
    data.forEach((item: any) => {
      if (item.profiles) {
        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        if (profile) {
          const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          if (name) {
            uniqueTechnicians.add(name);
          }
        }
      }
    });

    return Array.from(uniqueTechnicians);
  } catch (error: any) {
    console.error('Error fetching unique technicians:', error);
    throw new Error(error.message || 'Failed to fetch technicians');
  }
}
