
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone, address, city, state),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate, trim),
        profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        work_order_job_lines(
          id, name, category, subcategory, description, estimated_hours, 
          labor_rate, total_amount, status, notes, display_order, created_at, updated_at
        ),
        work_order_inventory_items(
          id, name, sku, category, quantity, unit_price, created_at, updated_at
        ),
        work_order_time_entries(
          id, employee_id, employee_name, start_time, end_time, 
          duration, billable, notes, created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    if (!data) return [];

    return data.map((workOrder: any) => {
      const customer = workOrder.customers;
      const vehicle = workOrder.vehicles;
      const technician = workOrder.profiles;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        
        // Vehicle information
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year?.toString() || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          vin: vehicle.vin || '',
          license_plate: vehicle.license_plate || '',
          trim: vehicle.trim || ''
        } : undefined,
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle.license_plate || '',
        
        // Technician information
        technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
        
        // Job lines
        jobLines: (workOrder.work_order_job_lines || []).map((jobLine: any): WorkOrderJobLine => ({
          id: jobLine.id,
          work_order_id: workOrder.id,
          name: jobLine.name,
          category: jobLine.category,
          subcategory: jobLine.subcategory,
          description: jobLine.description,
          estimated_hours: jobLine.estimated_hours,
          labor_rate: jobLine.labor_rate,
          total_amount: jobLine.total_amount,
          status: jobLine.status,
          notes: jobLine.notes,
          display_order: jobLine.display_order,
          created_at: jobLine.created_at,
          updated_at: jobLine.updated_at
        })),
        
        // Inventory items
        inventoryItems: (workOrder.work_order_inventory_items || []).map((item: any): WorkOrderInventoryItem => ({
          id: item.id,
          workOrderId: workOrder.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        })),
        
        // Time entries
        timeEntries: (workOrder.work_order_time_entries || []).map((entry: any): TimeEntry => ({
          id: entry.id,
          work_order_id: workOrder.id,
          employee_id: entry.employee_id,
          employee_name: entry.employee_name,
          start_time: entry.start_time,
          end_time: entry.end_time,
          duration: entry.duration,
          billable: entry.billable,
          notes: entry.notes,
          created_at: entry.created_at
        }))
      };
    });
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone, address, city, state),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate, trim),
        profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        work_order_job_lines(
          id, name, category, subcategory, description, estimated_hours, 
          labor_rate, total_amount, status, notes, display_order, created_at, updated_at
        ),
        work_order_inventory_items(
          id, name, sku, category, quantity, unit_price, created_at, updated_at
        ),
        work_order_time_entries(
          id, employee_id, employee_name, start_time, end_time, 
          duration, billable, notes, created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching work order by ID:', error);
      throw error;
    }

    if (!data) return null;

    const customer = data.customers;
    const vehicle = data.vehicles;
    const technician = data.profiles;

    return {
      ...data,
      // Customer information
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      
      // Vehicle information
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || '',
        trim: vehicle.trim || ''
      } : undefined,
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      
      // Technician information
      technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
      
      // Job lines
      jobLines: (data.work_order_job_lines || []).map((jobLine: any): WorkOrderJobLine => ({
        id: jobLine.id,
        work_order_id: data.id,
        name: jobLine.name,
        category: jobLine.category,
        subcategory: jobLine.subcategory,
        description: jobLine.description,
        estimated_hours: jobLine.estimated_hours,
        labor_rate: jobLine.labor_rate,
        total_amount: jobLine.total_amount,
        status: jobLine.status,
        notes: jobLine.notes,
        display_order: jobLine.display_order,
        created_at: jobLine.created_at,
        updated_at: jobLine.updated_at
      })),
      
      // Inventory items
      inventoryItems: (data.work_order_inventory_items || []).map((item: any): WorkOrderInventoryItem => ({
        id: item.id,
        workOrderId: data.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price
      })),
      
      // Time entries
      timeEntries: (data.work_order_time_entries || []).map((entry: any): TimeEntry => ({
        id: entry.id,
        work_order_id: data.id,
        employee_id: entry.employee_id,
        employee_name: entry.employee_name,
        start_time: entry.start_time,
        end_time: entry.end_time,
        duration: entry.duration,
        billable: entry.billable,
        notes: entry.notes,
        created_at: entry.created_at
      }))
    };
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone, address, city, state),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate, trim),
        profiles!work_orders_technician_id_fkey(id, first_name, last_name, email),
        work_order_job_lines(
          id, name, category, subcategory, description, estimated_hours, 
          labor_rate, total_amount, status, notes, display_order, created_at, updated_at
        ),
        work_order_inventory_items(
          id, name, sku, category, quantity, unit_price, created_at, updated_at
        ),
        work_order_time_entries(
          id, employee_id, employee_name, start_time, end_time, 
          duration, billable, notes, created_at
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by customer ID:', error);
      throw error;
    }

    if (!data) return [];

    return data.map((workOrder: any) => {
      const customer = workOrder.customers;
      const vehicle = workOrder.vehicles;
      const technician = workOrder.profiles;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        
        // Vehicle information
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year?.toString() || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          vin: vehicle.vin || '',
          license_plate: vehicle.license_plate || '',
          trim: vehicle.trim || ''
        } : undefined,
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Technician information
        technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
        
        // Job lines
        jobLines: (workOrder.work_order_job_lines || []).map((jobLine: any): WorkOrderJobLine => ({
          id: jobLine.id,
          work_order_id: workOrder.id,
          name: jobLine.name,
          category: jobLine.category,
          subcategory: jobLine.subcategory,
          description: jobLine.description,
          estimated_hours: jobLine.estimated_hours,
          labor_rate: jobLine.labor_rate,
          total_amount: jobLine.total_amount,
          status: jobLine.status,
          notes: jobLine.notes,
          display_order: jobLine.display_order,
          created_at: jobLine.created_at,
          updated_at: jobLine.updated_at
        })),
        
        // Inventory items
        inventoryItems: (workOrder.work_order_inventory_items || []).map((item: any): WorkOrderInventoryItem => ({
          id: item.id,
          workOrderId: workOrder.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price
        })),
        
        // Time entries
        timeEntries: (workOrder.work_order_time_entries || []).map((entry: any): TimeEntry => ({
          id: entry.id,
          work_order_id: workOrder.id,
          employee_id: entry.employee_id,
          employee_name: entry.employee_name,
          start_time: entry.start_time,
          end_time: entry.end_time,
          duration: entry.duration,
          billable: entry.billable,
          notes: entry.notes,
          created_at: entry.created_at
        }))
      };
    });
  } catch (error) {
    console.error('Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey(id, first_name, last_name, email, phone, address, city, state),
        vehicles!work_orders_vehicle_id_fkey(id, year, make, model, vin, license_plate, trim),
        profiles!work_orders_technician_id_fkey(id, first_name, last_name, email)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders by status:', error);
      throw error;
    }

    if (!data) return [];

    return data.map((workOrder: any) => {
      const customer = workOrder.customers;
      const vehicle = workOrder.vehicles;
      const technician = workOrder.profiles;

      return {
        ...workOrder,
        // Customer information
        customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        customer_email: customer?.email || '',
        customer_phone: customer?.phone || '',
        customer_address: customer?.address || '',
        customer_city: customer?.city || '',
        customer_state: customer?.state || '',
        customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
        
        // Vehicle information
        vehicle: vehicle ? {
          id: vehicle.id,
          year: vehicle.year?.toString() || '',
          make: vehicle.make || '',
          model: vehicle.model || '',
          vin: vehicle.vin || '',
          license_plate: vehicle.license_plate || '',
          trim: vehicle.trim || ''
        } : undefined,
        vehicle_make: vehicle?.make || '',
        vehicle_model: vehicle?.model || '',
        vehicle_year: vehicle?.year?.toString() || '',
        vehicle_vin: vehicle?.vin || '',
        vehicle_license_plate: vehicle?.license_plate || '',
        
        // Technician information
        technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : ''
      };
    });
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

export const getUniqueTechnicians = async (): Promise<Array<{id: string; name: string}>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .not('first_name', 'is', null)
      .order('first_name');

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    if (!data) return [];

    return data.map((technician: any) => ({
      id: technician.id,
      name: `${technician.first_name || ''} ${technician.last_name || ''}`.trim()
    }));
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    return [];
  }
};
