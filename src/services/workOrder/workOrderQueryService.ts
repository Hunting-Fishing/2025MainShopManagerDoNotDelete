
import { supabase } from '@/integrations/supabase/client';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderInventoryItem } from '@/types/workOrder';

export const getWorkOrderWithDetails = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order with details for ID:', id);
    
    const { data, error } = await supabase
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
          state,
          postal_code
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
      .maybeSingle();

    if (error) {
      console.error('Error fetching work order with details:', error);
      throw error;
    }

    if (!data) {
      console.log('No work order found with ID:', id);
      return null;
    }

    console.log('Raw work order data:', data);

    // Fetch job lines separately
    const { data: jobLinesData, error: jobLinesError } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', id)
      .order('display_order', { ascending: true });

    if (jobLinesError) {
      console.error('Error fetching job lines:', jobLinesError);
    }

    // Fetch inventory items separately  
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', id);

    if (inventoryError) {
      console.error('Error fetching inventory items:', inventoryError);
    }

    // Fetch time entries separately
    const { data: timeEntriesData, error: timeEntriesError } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', id)
      .order('created_at', { ascending: false });

    if (timeEntriesError) {
      console.error('Error fetching time entries:', timeEntriesError);
    }

    // Transform the data to match WorkOrder interface
    const transformedWorkOrder: WorkOrder = {
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
      work_order_number: data.work_order_number,

      // Customer information - safely access the customer object
      customer_name: data.customers ? `${data.customers.first_name || ''} ${data.customers.last_name || ''}`.trim() : '',
      customer: data.customers ? `${data.customers.first_name || ''} ${data.customers.last_name || ''}`.trim() : '',
      customer_email: data.customers?.email || '',
      customer_phone: data.customers?.phone || '',
      customer_address: data.customers?.address || '',
      customer_city: data.customers?.city || '',
      customer_state: data.customers?.state || '',
      customer_zip: data.customers?.postal_code || '',

      // Vehicle information - safely access the vehicle object
      vehicle_year: data.vehicles?.year ? String(data.vehicles.year) : '',
      vehicle_make: data.vehicles?.make || '',
      vehicle_model: data.vehicles?.model || '',
      vehicle_vin: data.vehicles?.vin || '',
      vehicle_license_plate: data.vehicles?.license_plate || '',
      vehicle: data.vehicles ? {
        id: data.vehicles.id,
        year: data.vehicles.year,
        make: data.vehicles.make,
        model: data.vehicles.model,
        vin: data.vehicles.vin,
        license_plate: data.vehicles.license_plate,
        trim: data.vehicles.trim
      } : undefined,

      // Technician information - safely access the technician object
      technician: data.profiles ? `${data.profiles.first_name || ''} ${data.profiles.last_name || ''}`.trim() : '',

      // Transform job lines to match WorkOrderJobLine interface
      jobLines: jobLinesData?.map((jl): WorkOrderJobLine => ({
        id: jl.id,
        workOrderId: jl.work_order_id,
        name: jl.name,
        category: jl.category,
        subcategory: jl.subcategory,
        description: jl.description,
        estimatedHours: jl.estimated_hours,
        laborRate: jl.labor_rate,
        totalAmount: jl.total_amount,
        status: jl.status as 'pending' | 'in-progress' | 'completed' | 'on-hold',
        notes: jl.notes,
        createdAt: jl.created_at,
        updatedAt: jl.updated_at
      })) || [],

      // Transform inventory items to match WorkOrderInventoryItem interface
      inventoryItems: inventoryData?.map((item): WorkOrderInventoryItem => ({
        id: item.id,
        workOrderId: item.work_order_id,
        name: item.name,
        sku: item.sku || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: (item.quantity || 0) * (item.unit_price || 0)
      })) || [],

      inventory_items: inventoryData?.map((item): WorkOrderInventoryItem => ({
        id: item.id,
        workOrderId: item.work_order_id,
        name: item.name,
        sku: item.sku || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: (item.quantity || 0) * (item.unit_price || 0)
      })) || [],

      // Add time entries
      timeEntries: timeEntriesData || [],

      // Backward compatibility fields
      date: data.created_at,
      dueDate: data.end_time,
      due_date: data.end_time,
      priority: 'medium', // Default priority
      location: '', // Default location
      notes: data.description || ''
    };

    console.log('Transformed work order:', transformedWorkOrder);
    return transformedWorkOrder;

  } catch (error) {
    console.error('Error in getWorkOrderWithDetails:', error);
    throw error;
  }
};

export const getAllWorkOrdersWithDetails = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders with details...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        vehicles!work_orders_vehicle_id_fkey (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        ),
        profiles!work_orders_technician_id_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work orders:', error);
      throw error;
    }

    if (!data) {
      console.log('No work orders found');
      return [];
    }

    console.log('Raw work orders data:', data);

    // Transform each work order
    const transformedWorkOrders: WorkOrder[] = data.map((workOrder): WorkOrder => ({
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
      work_order_number: workOrder.work_order_number,

      // Customer information - safely access the customer object
      customer_name: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
      customer: workOrder.customers ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : '',
      customer_email: workOrder.customers?.email || '',
      customer_phone: workOrder.customers?.phone || '',

      // Vehicle information - safely access the vehicle object
      vehicle_year: workOrder.vehicles?.year ? String(workOrder.vehicles.year) : '',
      vehicle_make: workOrder.vehicles?.make || '',
      vehicle_model: workOrder.vehicles?.model || '',
      vehicle_vin: workOrder.vehicles?.vin || '',
      vehicle_license_plate: workOrder.vehicles?.license_plate || '',
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate
      } : undefined,

      // Technician information - safely access the technician object
      technician: workOrder.profiles ? `${workOrder.profiles.first_name || ''} ${workOrder.profiles.last_name || ''}`.trim() : '',

      // Initialize empty arrays for related data (will be populated separately if needed)
      jobLines: [],
      inventoryItems: [],
      inventory_items: [],
      timeEntries: [],

      // Backward compatibility fields
      date: workOrder.created_at,
      dueDate: workOrder.end_time,
      due_date: workOrder.end_time,
      priority: 'medium', // Default priority
      location: '', // Default location
      notes: workOrder.description || ''
    }));

    console.log('Transformed work orders:', transformedWorkOrders);
    return transformedWorkOrders;

  } catch (error) {
    console.error('Error in getAllWorkOrdersWithDetails:', error);
    throw error;
  }
};
