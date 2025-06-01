
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  console.log('Fetching all work orders with vehicle information...');
  
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    console.log('Raw work orders data:', data);

    if (!data) {
      return [];
    }

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      console.log('Processing work order:', wo.id, 'with vehicle data:', wo.vehicles);
      
      const workOrder: WorkOrder = {
        id: wo.id,
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
        status: wo.status || 'pending',
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        
        // Legacy fields for backward compatibility
        customer: wo.customer || wo.customer_name,
        customer_name: wo.customer_name,
        customer_email: wo.customer_email,
        customer_phone: wo.customer_phone,
        customer_address: wo.customer_address,
        technician: wo.technician,
        date: wo.created_at,
        dueDate: wo.due_date,
        due_date: wo.due_date,
        priority: wo.priority,
        location: wo.location,
        notes: wo.notes,
        
        // Individual vehicle fields for backward compatibility
        vehicle_make: wo.vehicle_make,
        vehicle_model: wo.vehicle_model,
        vehicle_year: wo.vehicle_year,
        vehicle_vin: wo.vehicle_vin,
        vehicle_license_plate: wo.vehicle_license_plate,
        vehicle_odometer: wo.vehicle_odometer
      };

      // Add vehicle object if we have vehicle data from the join
      if (wo.vehicles && typeof wo.vehicles === 'object' && !Array.isArray(wo.vehicles)) {
        workOrder.vehicle = {
          id: wo.vehicles.id,
          year: wo.vehicles.year,
          make: wo.vehicles.make,
          model: wo.vehicles.model,
          vin: wo.vehicles.vin,
          license_plate: wo.vehicles.license_plate,
          trim: wo.vehicles.trim
        };
        console.log('Added vehicle object to work order:', workOrder.vehicle);
      }

      return workOrder;
    });

    console.log('Transformed work orders:', workOrders);
    return workOrders;
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  console.log('Fetching work order by ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('Work order not found:', id);
      return null;
    }

    console.log('Raw work order data:', data);

    const workOrder: WorkOrder = {
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
      description: data.description,
      service_type: data.service_type,
      invoice_id: data.invoice_id,
      
      // Legacy fields for backward compatibility
      customer: data.customer || data.customer_name,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      technician: data.technician,
      date: data.created_at,
      dueDate: data.due_date,
      due_date: data.due_date,
      priority: data.priority,
      location: data.location,
      notes: data.notes,
      
      // Individual vehicle fields for backward compatibility
      vehicle_make: data.vehicle_make,
      vehicle_model: data.vehicle_model,
      vehicle_year: data.vehicle_year,
      vehicle_vin: data.vehicle_vin,
      vehicle_license_plate: data.vehicle_license_plate,
      vehicle_odometer: data.vehicle_odometer
    };

    // Add vehicle object if we have vehicle data from the join
    if (data.vehicles && typeof data.vehicles === 'object' && !Array.isArray(data.vehicles)) {
      workOrder.vehicle = {
        id: data.vehicles.id,
        year: data.vehicles.year,
        make: data.vehicles.make,
        model: data.vehicles.model,
        vin: data.vehicles.vin,
        license_plate: data.vehicles.license_plate,
        trim: data.vehicles.trim
      };
      console.log('Added vehicle object to work order:', workOrder.vehicle);
    }

    console.log('Transformed work order:', workOrder);
    return workOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  console.log('Fetching work orders for customer:', customerId);
  
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders for customer:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    console.log('Raw work orders data for customer:', data);

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const workOrder: WorkOrder = {
        id: wo.id,
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
        status: wo.status || 'pending',
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        
        // Legacy fields for backward compatibility
        customer: wo.customer || wo.customer_name,
        customer_name: wo.customer_name,
        customer_email: wo.customer_email,
        customer_phone: wo.customer_phone,
        customer_address: wo.customer_address,
        technician: wo.technician,
        date: wo.created_at,
        dueDate: wo.due_date,
        due_date: wo.due_date,
        priority: wo.priority,
        location: wo.location,
        notes: wo.notes,
        
        // Individual vehicle fields for backward compatibility
        vehicle_make: wo.vehicle_make,
        vehicle_model: wo.vehicle_model,
        vehicle_year: wo.vehicle_year,
        vehicle_vin: wo.vehicle_vin,
        vehicle_license_plate: wo.vehicle_license_plate,
        vehicle_odometer: wo.vehicle_odometer
      };

      // Add vehicle object if we have vehicle data from the join
      if (wo.vehicles && typeof wo.vehicles === 'object' && !Array.isArray(wo.vehicles)) {
        workOrder.vehicle = {
          id: wo.vehicles.id,
          year: wo.vehicles.year,
          make: wo.vehicles.make,
          model: wo.vehicles.model,
          vin: wo.vehicles.vin,
          license_plate: wo.vehicles.license_plate,
          trim: wo.vehicles.trim
        };
      }

      return workOrder;
    });

    console.log('Transformed work orders for customer:', workOrders);
    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  console.log('Fetching work orders by status:', status);
  
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        vehicles:vehicle_id (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our WorkOrder interface
    const workOrders: WorkOrder[] = data.map((wo: any) => {
      const workOrder: WorkOrder = {
        id: wo.id,
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
        status: wo.status || 'pending',
        description: wo.description,
        service_type: wo.service_type,
        invoice_id: wo.invoice_id,
        
        // Legacy fields for backward compatibility
        customer: wo.customer || wo.customer_name,
        customer_name: wo.customer_name,
        customer_email: wo.customer_email,
        customer_phone: wo.customer_phone,
        customer_address: wo.customer_address,
        technician: wo.technician,
        date: wo.created_at,
        dueDate: wo.due_date,
        due_date: wo.due_date,
        priority: wo.priority,
        location: wo.location,
        notes: wo.notes,
        
        // Individual vehicle fields for backward compatibility
        vehicle_make: wo.vehicle_make,
        vehicle_model: wo.vehicle_model,
        vehicle_year: wo.vehicle_year,
        vehicle_vin: wo.vehicle_vin,
        vehicle_license_plate: wo.vehicle_license_plate,
        vehicle_odometer: wo.vehicle_odometer
      };

      // Add vehicle object if we have vehicle data from the join
      if (wo.vehicles && typeof wo.vehicles === 'object' && !Array.isArray(wo.vehicles)) {
        workOrder.vehicle = {
          id: wo.vehicles.id,
          year: wo.vehicles.year,
          make: wo.vehicles.make,
          model: wo.vehicles.model,
          vin: wo.vehicles.vin,
          license_plate: wo.vehicles.license_plate,
          trim: wo.vehicles.trim
        };
      }

      return workOrder;
    });

    return workOrders;
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};
