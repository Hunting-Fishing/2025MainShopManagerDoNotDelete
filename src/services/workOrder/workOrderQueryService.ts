
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine, JobLineStatus } from '@/types/jobLine';
import { WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';

// Helper function to safely cast status to JobLineStatus
const castToJobLineStatus = (status: string): JobLineStatus => {
  const validStatuses: JobLineStatus[] = ['pending', 'in-progress', 'completed', 'on-hold'];
  return validStatuses.includes(status as JobLineStatus) ? status as JobLineStatus : 'pending';
};

export async function getAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    console.log('Fetching all work orders with related data...');
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Work orders fetched successfully:', workOrders?.length || 0);

    if (!workOrders) return [];

    // Fetch related data for each work order
    const workOrdersWithDetails = await Promise.all(
      workOrders.map(async (wo) => {
        // Fetch job lines
        const { data: jobLinesData } = await supabase
          .from('work_order_job_lines')
          .select('*')
          .eq('work_order_id', wo.id)
          .order('display_order', { ascending: true });

        const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map((jl) => ({
          id: jl.id,
          workOrderId: jl.work_order_id,
          name: jl.name,
          category: jl.category,
          subcategory: jl.subcategory,
          description: jl.description,
          estimatedHours: jl.estimated_hours,
          laborRate: jl.labor_rate,
          totalAmount: jl.total_amount,
          status: castToJobLineStatus(jl.status),
          notes: jl.notes,
          createdAt: jl.created_at,
          updatedAt: jl.updated_at
        }));

        // Fetch inventory items
        const { data: inventoryData } = await supabase
          .from('work_order_inventory_items')
          .select('*')
          .eq('work_order_id', wo.id);

        const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map((item) => ({
          id: item.id,
          workOrderId: wo.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          notes: item.notes || ''
        }));

        // Fetch time entries
        const { data: timeData } = await supabase
          .from('work_order_time_entries')
          .select('*')
          .eq('work_order_id', wo.id);

        const timeEntries: TimeEntry[] = (timeData || []).map((entry) => ({
          id: entry.id,
          work_order_id: entry.work_order_id,
          employee_id: entry.employee_id,
          employee_name: entry.employee_name,
          start_time: entry.start_time,
          end_time: entry.end_time,
          duration: entry.duration,
          billable: entry.billable,
          notes: entry.notes,
          created_at: entry.created_at
        }));

        // Build the work order object
        const customer = wo.customers;
        const vehicle = wo.vehicles;
        const technician = wo.profiles;

        return {
          ...wo,
          // String format for backward compatibility
          customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
          date: wo.created_at,
          dueDate: wo.end_time,
          due_date: wo.end_time,
          priority: 'medium' as const,
          location: '',
          notes: wo.description || '',
          
          // Customer information
          customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          customer_email: customer?.email || '',
          customer_phone: customer?.phone || '',
          customer_address: customer?.address || '',
          customer_city: customer?.city || '',
          customer_state: customer?.state || '',
          
          // Vehicle information
          vehicle_make: vehicle?.make || '',
          vehicle_model: vehicle?.model || '',
          vehicle_year: vehicle?.year?.toString() || '',
          vehicle_vin: vehicle?.vin || '',
          vehicle_license_plate: vehicle?.license_plate || '',
          
          // Vehicle object
          vehicle: vehicle ? {
            id: vehicle.id,
            year: vehicle.year?.toString() || '',
            make: vehicle.make || '',
            model: vehicle.model || '',
            vin: vehicle.vin || '',
            license_plate: vehicle.license_plate || '',
            trim: vehicle.trim || ''
          } : undefined,
          
          // Related data
          jobLines,
          timeEntries,
          inventoryItems,
          inventory_items: inventoryItems
        } as WorkOrder;
      })
    );

    return workOrdersWithDetails;
  } catch (error) {
    console.error('Error fetching work orders:', error);
    throw error;
  }
}

export async function getWorkOrderById(id: string): Promise<WorkOrder> {
  try {
    console.log('Fetching work order by ID:', id);
    
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!workOrder) throw new Error('Work order not found');

    // Fetch job lines
    const { data: jobLinesData } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrder.id)
      .order('display_order', { ascending: true });

    const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map((jl) => ({
      id: jl.id,
      workOrderId: jl.work_order_id,
      name: jl.name,
      category: jl.category,
      subcategory: jl.subcategory,
      description: jl.description,
      estimatedHours: jl.estimated_hours,
      laborRate: jl.labor_rate,
      totalAmount: jl.total_amount,
      status: castToJobLineStatus(jl.status),
      notes: jl.notes,
      createdAt: jl.created_at,
      updatedAt: jl.updated_at
    }));

    // Fetch inventory items
    const { data: inventoryData } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', workOrder.id);

    const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map((item) => ({
      id: item.id,
      workOrderId: workOrder.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      notes: item.notes || ''
    }));

    // Fetch time entries
    const { data: timeData } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrder.id);

    const timeEntries: TimeEntry[] = (timeData || []).map((entry) => ({
      id: entry.id,
      work_order_id: entry.work_order_id,
      employee_id: entry.employee_id,
      employee_name: entry.employee_name,
      start_time: entry.start_time,
      end_time: entry.end_time,
      duration: entry.duration,
      billable: entry.billable,
      notes: entry.notes,
      created_at: entry.created_at
    }));

    // Build the work order object
    const customer = workOrder.customers;
    const vehicle = workOrder.vehicles;
    const technician = workOrder.profiles;

    return {
      ...workOrder,
      // String format for backward compatibility
      customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
      date: workOrder.created_at,
      dueDate: workOrder.end_time,
      due_date: workOrder.end_time,
      priority: 'medium' as const,
      location: '',
      notes: workOrder.description || '',
      
      // Customer information
      customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      
      // Vehicle information
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      
      // Vehicle object
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || '',
        trim: vehicle.trim || ''
      } : undefined,
      
      // Related data
      jobLines,
      timeEntries,
      inventoryItems,
      inventory_items: inventoryItems
    } as WorkOrder;
  } catch (error) {
    console.error('Error fetching work order by ID:', error);
    throw error;
  }
}

export async function getWorkOrdersByCustomerId(customerId: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Work orders fetched for customer:', workOrders?.length || 0);

    if (!workOrders) return [];

    // Fetch related data for each work order
    const workOrdersWithDetails = await Promise.all(
      workOrders.map(async (wo) => {
        // Fetch job lines
        const { data: jobLinesData } = await supabase
          .from('work_order_job_lines')
          .select('*')
          .eq('work_order_id', wo.id)
          .order('display_order', { ascending: true });

        const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map((jl) => ({
          id: jl.id,
          workOrderId: jl.work_order_id,
          name: jl.name,
          category: jl.category,
          subcategory: jl.subcategory,
          description: jl.description,
          estimatedHours: jl.estimated_hours,
          laborRate: jl.labor_rate,
          totalAmount: jl.total_amount,
          status: castToJobLineStatus(jl.status),
          notes: jl.notes,
          createdAt: jl.created_at,
          updatedAt: jl.updated_at
        }));

        // Fetch inventory items
        const { data: inventoryData } = await supabase
          .from('work_order_inventory_items')
          .select('*')
          .eq('work_order_id', wo.id);

        const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map((item) => ({
          id: item.id,
          workOrderId: wo.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          notes: item.notes || ''
        }));

        // Fetch time entries
        const { data: timeData } = await supabase
          .from('work_order_time_entries')
          .select('*')
          .eq('work_order_id', wo.id);

        const timeEntries: TimeEntry[] = (timeData || []).map((entry) => ({
          id: entry.id,
          work_order_id: entry.work_order_id,
          employee_id: entry.employee_id,
          employee_name: entry.employee_name,
          start_time: entry.start_time,
          end_time: entry.end_time,
          duration: entry.duration,
          billable: entry.billable,
          notes: entry.notes,
          created_at: entry.created_at
        }));

        // Build the work order object
        const customer = wo.customers;
        const vehicle = wo.vehicles;
        const technician = wo.profiles;

        return {
          ...wo,
          // String format for backward compatibility
          customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
          date: wo.created_at,
          dueDate: wo.end_time,
          due_date: wo.end_time,
          priority: 'medium' as const,
          location: '',
          notes: wo.description || '',
          
          // Customer information
          customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          customer_email: customer?.email || '',
          customer_phone: customer?.phone || '',
          customer_address: customer?.address || '',
          customer_city: customer?.city || '',
          customer_state: customer?.state || '',
          
          // Vehicle information
          vehicle_make: vehicle?.make || '',
          vehicle_model: vehicle?.model || '',
          vehicle_year: vehicle?.year?.toString() || '',
          vehicle_vin: vehicle?.vin || '',
          vehicle_license_plate: vehicle?.license_plate || '',
          
          // Vehicle object
          vehicle: vehicle ? {
            id: vehicle.id,
            year: vehicle.year?.toString() || '',
            make: vehicle.make || '',
            model: vehicle.model || '',
            vin: vehicle.vin || '',
            license_plate: vehicle.license_plate || '',
            trim: vehicle.trim || ''
          } : undefined,
          
          // Related data
          jobLines,
          timeEntries,
          inventoryItems,
          inventory_items: inventoryItems
        } as WorkOrder;
      })
    );

    return workOrdersWithDetails;
  } catch (error) {
    console.error('Error fetching work orders by customer ID:', error);
    throw error;
  }
}

export async function getWorkOrdersByStatus(status: string): Promise<WorkOrder[]> {
  try {
    console.log('Fetching work orders by status:', status);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          address,
          city,
          state
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Work orders fetched by status:', workOrders?.length || 0);

    if (!workOrders) return [];

    // Fetch related data for each work order
    const workOrdersWithDetails = await Promise.all(
      workOrders.map(async (wo) => {
        // Fetch job lines
        const { data: jobLinesData } = await supabase
          .from('work_order_job_lines')
          .select('*')
          .eq('work_order_id', wo.id)
          .order('display_order', { ascending: true });

        const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map((jl) => ({
          id: jl.id,
          workOrderId: jl.work_order_id,
          name: jl.name,
          category: jl.category,
          subcategory: jl.subcategory,
          description: jl.description,
          estimatedHours: jl.estimated_hours,
          laborRate: jl.labor_rate,
          totalAmount: jl.total_amount,
          status: castToJobLineStatus(jl.status),
          notes: jl.notes,
          createdAt: jl.created_at,
          updatedAt: jl.updated_at
        }));

        // Fetch inventory items
        const { data: inventoryData } = await supabase
          .from('work_order_inventory_items')
          .select('*')
          .eq('work_order_id', wo.id);

        const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map((item) => ({
          id: item.id,
          workOrderId: wo.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          notes: item.notes || ''
        }));

        // Fetch time entries
        const { data: timeData } = await supabase
          .from('work_order_time_entries')
          .select('*')
          .eq('work_order_id', wo.id);

        const timeEntries: TimeEntry[] = (timeData || []).map((entry) => ({
          id: entry.id,
          work_order_id: entry.work_order_id,
          employee_id: entry.employee_id,
          employee_name: entry.employee_name,
          start_time: entry.start_time,
          end_time: entry.end_time,
          duration: entry.duration,
          billable: entry.billable,
          notes: entry.notes,
          created_at: entry.created_at
        }));

        // Build the work order object
        const customer = wo.customers;
        const vehicle = wo.vehicles;
        const technician = wo.profiles;

        return {
          ...wo,
          // String format for backward compatibility
          customer: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          technician: technician ? `${technician.first_name || ''} ${technician.last_name || ''}`.trim() : '',
          date: wo.created_at,
          dueDate: wo.end_time,
          due_date: wo.end_time,
          priority: 'medium' as const,
          location: '',
          notes: wo.description || '',
          
          // Customer information
          customer_name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : '',
          customer_email: customer?.email || '',
          customer_phone: customer?.phone || '',
          customer_address: customer?.address || '',
          customer_city: customer?.city || '',
          customer_state: customer?.state || '',
          
          // Vehicle information
          vehicle_make: vehicle?.make || '',
          vehicle_model: vehicle?.model || '',
          vehicle_year: vehicle?.year?.toString() || '',
          vehicle_vin: vehicle?.vin || '',
          vehicle_license_plate: vehicle?.license_plate || '',
          
          // Vehicle object
          vehicle: vehicle ? {
            id: vehicle.id,
            year: vehicle.year?.toString() || '',
            make: vehicle.make || '',
            model: vehicle.model || '',
            vin: vehicle.vin || '',
            license_plate: vehicle.license_plate || '',
            trim: vehicle.trim || ''
          } : undefined,
          
          // Related data
          jobLines,
          timeEntries,
          inventoryItems,
          inventory_items: inventoryItems
        } as WorkOrder;
      })
    );

    return workOrdersWithDetails;
  } catch (error) {
    console.error('Error fetching work orders by status:', error);
    throw error;
  }
}

export async function getUniqueTechnicians(): Promise<Array<{id: string; name: string}>> {
  try {
    console.log('Fetching unique technicians from work orders...');
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .not('technician_id', 'is', null);

    if (error) throw error;

    if (!workOrders) return [];

    // Extract unique technicians
    const technicianMap = new Map<string, {id: string; name: string}>();
    
    workOrders.forEach((wo) => {
      const technician = wo.profiles;
      if (technician && !technicianMap.has(technician.id)) {
        technicianMap.set(technician.id, {
          id: technician.id,
          name: `${technician.first_name || ''} ${technician.last_name || ''}`.trim()
        });
      }
    });

    const technicians = Array.from(technicianMap.values());
    console.log('Unique technicians found:', technicians.length);
    
    return technicians;
  } catch (error) {
    console.error('Error fetching unique technicians:', error);
    throw error;
  }
}
