
import { supabase } from "@/integrations/supabase/client";
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from "@/types/workOrder";
import { WorkOrderJobLine, JobLineStatus } from "@/types/jobLine";

// Helper function to safely cast status to JobLineStatus
const castToJobLineStatus = (status: string): JobLineStatus => {
  const validStatuses: JobLineStatus[] = ['pending', 'in-progress', 'completed', 'on-hold'];
  return validStatuses.includes(status as JobLineStatus) ? (status as JobLineStatus) : 'pending';
};

/**
 * Get all work orders with their related data
 */
export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getAllWorkOrders: Starting to fetch all work orders...');
    
    const { data: workOrdersData, error } = await supabase
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
        vehicles (
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
      console.error('getAllWorkOrders: Supabase error:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log('getAllWorkOrders: No work orders found');
      return [];
    }

    console.log(`getAllWorkOrders: Found ${workOrdersData.length} work orders`);

    // Fetch related data for each work order
    const workOrdersWithDetails = await Promise.all(
      workOrdersData.map(async (workOrder) => {
        try {
          // Get job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(line => ({
            id: line.id,
            workOrderId: line.work_order_id,
            name: line.name || '',
            category: line.category || '',
            subcategory: line.subcategory || '',
            description: line.description || '',
            estimatedHours: Number(line.estimated_hours || 0),
            laborRate: Number(line.labor_rate || 0),
            totalAmount: Number(line.total_amount || 0),
            status: castToJobLineStatus(line.status || 'pending'),
            notes: line.notes || '',
            createdAt: line.created_at,
            updatedAt: line.updated_at
          }));

          // Get inventory items
          const { data: inventoryData } = await supabase
            .from('work_order_inventory_items')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
            id: item.id,
            workOrderId: item.work_order_id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total: Number(item.unit_price) * item.quantity,
            notes: '' // Default empty notes since not in DB schema
          }));

          // Get time entries
          const { data: timeData } = await supabase
            .from('work_order_time_entries')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const timeEntries: TimeEntry[] = (timeData || []).map(entry => ({
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

          // Safely access customer data
          const customer = Array.isArray(workOrder.customers) && workOrder.customers.length > 0 
            ? workOrder.customers[0] 
            : workOrder.customers;

          const customerName = customer 
            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
            : '';

          return {
            ...workOrder,
            customer_name: customerName,
            customer_email: customer?.email || '',
            customer_phone: customer?.phone || '',
            jobLines,
            inventory_items: inventoryItems,
            timeEntries
          } as WorkOrder;
        } catch (err) {
          console.error(`Error processing work order ${workOrder.id}:`, err);
          return {
            ...workOrder,
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            jobLines: [],
            inventory_items: [],
            timeEntries: []
          } as WorkOrder;
        }
      })
    );

    console.log(`getAllWorkOrders: Successfully processed ${workOrdersWithDetails.length} work orders`);
    return workOrdersWithDetails;
  } catch (error) {
    console.error('getAllWorkOrders: Unexpected error:', error);
    throw new Error(`Failed to fetch work orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work orders by customer ID
 */
export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log(`getWorkOrdersByCustomerId: Fetching work orders for customer ${customerId}`);
    
    const { data: workOrdersData, error } = await supabase
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
        vehicles (
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
      console.error('getWorkOrdersByCustomerId: Supabase error:', error);
      throw new Error(`Failed to fetch work orders for customer: ${error.message}`);
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log(`getWorkOrdersByCustomerId: No work orders found for customer ${customerId}`);
      return [];
    }

    console.log(`getWorkOrdersByCustomerId: Found ${workOrdersData.length} work orders for customer ${customerId}`);

    // Process each work order with related data
    const workOrdersWithDetails = await Promise.all(
      workOrdersData.map(async (workOrder) => {
        try {
          // Get job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(line => ({
            id: line.id,
            workOrderId: line.work_order_id,
            name: line.name || '',
            category: line.category || '',
            subcategory: line.subcategory || '',
            description: line.description || '',
            estimatedHours: Number(line.estimated_hours || 0),
            laborRate: Number(line.labor_rate || 0),
            totalAmount: Number(line.total_amount || 0),
            status: castToJobLineStatus(line.status || 'pending'),
            notes: line.notes || '',
            createdAt: line.created_at,
            updatedAt: line.updated_at
          }));

          // Get inventory items
          const { data: inventoryData } = await supabase
            .from('work_order_inventory_items')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
            id: item.id,
            workOrderId: item.work_order_id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total: Number(item.unit_price) * item.quantity,
            notes: '' // Default empty notes since not in DB schema
          }));

          // Get time entries
          const { data: timeData } = await supabase
            .from('work_order_time_entries')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const timeEntries: TimeEntry[] = (timeData || []).map(entry => ({
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

          // Safely access customer data
          const customer = Array.isArray(workOrder.customers) && workOrder.customers.length > 0 
            ? workOrder.customers[0] 
            : workOrder.customers;

          const customerName = customer 
            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
            : '';

          return {
            ...workOrder,
            customer_name: customerName,
            customer_email: customer?.email || '',
            customer_phone: customer?.phone || '',
            jobLines,
            inventory_items: inventoryItems,
            timeEntries
          } as WorkOrder;
        } catch (err) {
          console.error(`Error processing work order ${workOrder.id}:`, err);
          return {
            ...workOrder,
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            jobLines: [],
            inventory_items: [],
            timeEntries: []
          } as WorkOrder;
        }
      })
    );

    console.log(`getWorkOrdersByCustomerId: Successfully processed ${workOrdersWithDetails.length} work orders`);
    return workOrdersWithDetails;
  } catch (error) {
    console.error('getWorkOrdersByCustomerId: Unexpected error:', error);
    throw new Error(`Failed to fetch work orders by customer ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get a single work order by ID with all related data
 */
export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log(`getWorkOrderById: Fetching work order ${id}`);
    
    const { data: workOrderData, error } = await supabase
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
        vehicles (
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
      console.error('getWorkOrderById: Supabase error:', error);
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    if (!workOrderData) {
      console.log(`getWorkOrderById: Work order ${id} not found`);
      return null;
    }

    console.log(`getWorkOrderById: Found work order ${id}`);

    // Get job lines
    const { data: jobLinesData } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderData.id);

    const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(line => ({
      id: line.id,
      workOrderId: line.work_order_id,
      name: line.name || '',
      category: line.category || '',
      subcategory: line.subcategory || '',
      description: line.description || '',
      estimatedHours: Number(line.estimated_hours || 0),
      laborRate: Number(line.labor_rate || 0),
      totalAmount: Number(line.total_amount || 0),
      status: castToJobLineStatus(line.status || 'pending'),
      notes: line.notes || '',
      createdAt: line.created_at,
      updatedAt: line.updated_at
    }));

    // Get inventory items
    const { data: inventoryData } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', workOrderData.id);

    const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      total: Number(item.unit_price) * item.quantity,
      notes: '' // Default empty notes since not in DB schema
    }));

    // Get time entries
    const { data: timeData } = await supabase
      .from('work_order_time_entries')
      .select('*')
      .eq('work_order_id', workOrderData.id);

    const timeEntries: TimeEntry[] = (timeData || []).map(entry => ({
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

    // Safely access customer data
    const customer = Array.isArray(workOrderData.customers) && workOrderData.customers.length > 0 
      ? workOrderData.customers[0] 
      : workOrderData.customers;

    const customerName = customer 
      ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
      : '';

    const result: WorkOrder = {
      ...workOrderData,
      customer_name: customerName,
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      jobLines,
      inventory_items: inventoryItems,
      timeEntries
    };

    console.log(`getWorkOrderById: Successfully processed work order ${id}`);
    return result;
  } catch (error) {
    console.error('getWorkOrderById: Unexpected error:', error);
    throw new Error(`Failed to fetch work order by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get work orders for the calendar view
 */
export const getWorkOrdersForCalendar = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersForCalendar: Fetching work orders for calendar...');
    
    const { data: workOrdersData, error } = await supabase
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
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate,
          trim
        )
      `)
      .not('start_time', 'is', null)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('getWorkOrdersForCalendar: Supabase error:', error);
      throw new Error(`Failed to fetch work orders for calendar: ${error.message}`);
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log('getWorkOrdersForCalendar: No scheduled work orders found');
      return [];
    }

    console.log(`getWorkOrdersForCalendar: Found ${workOrdersData.length} scheduled work orders`);

    // Process each work order with related data
    const workOrdersWithDetails = await Promise.all(
      workOrdersData.map(async (workOrder) => {
        try {
          // Get job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(line => ({
            id: line.id,
            workOrderId: line.work_order_id,
            name: line.name || '',
            category: line.category || '',
            subcategory: line.subcategory || '',
            description: line.description || '',
            estimatedHours: Number(line.estimated_hours || 0),
            laborRate: Number(line.labor_rate || 0),
            totalAmount: Number(line.total_amount || 0),
            status: castToJobLineStatus(line.status || 'pending'),
            notes: line.notes || '',
            createdAt: line.created_at,
            updatedAt: line.updated_at
          }));

          // Get inventory items
          const { data: inventoryData } = await supabase
            .from('work_order_inventory_items')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
            id: item.id,
            workOrderId: item.work_order_id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
            total: Number(item.unit_price) * item.quantity,
            notes: '' // Default empty notes since not in DB schema
          }));

          // Get time entries
          const { data: timeData } = await supabase
            .from('work_order_time_entries')
            .select('*')
            .eq('work_order_id', workOrder.id);

          const timeEntries: TimeEntry[] = (timeData || []).map(entry => ({
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

          // Safely access customer data
          const customer = Array.isArray(workOrder.customers) && workOrder.customers.length > 0 
            ? workOrder.customers[0] 
            : workOrder.customers;

          const customerName = customer 
            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
            : '';

          return {
            ...workOrder,
            customer_name: customerName,
            customer_email: customer?.email || '',
            customer_phone: customer?.phone || '',
            jobLines,
            inventory_items: inventoryItems,
            timeEntries
          } as WorkOrder;
        } catch (err) {
          console.error(`Error processing work order ${workOrder.id}:`, err);
          return {
            ...workOrder,
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            jobLines: [],
            inventory_items: [],
            timeEntries: []
          } as WorkOrder;
        }
      })
    );

    console.log(`getWorkOrdersForCalendar: Successfully processed ${workOrdersWithDetails.length} work orders`);
    return workOrdersWithDetails;
  } catch (error) {
    console.error('getWorkOrdersForCalendar: Unexpected error:', error);
    throw new Error(`Failed to fetch work orders for calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get unique technicians from work orders
 */
export const getUniqueTechnicians = async (): Promise<Array<{id: string; name: string}>> => {
  try {
    console.log('getUniqueTechnicians: Fetching unique technicians from work orders...');
    
    const { data: workOrdersData, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('getUniqueTechnicians: Supabase error:', error);
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }

    if (!workOrdersData || workOrdersData.length === 0) {
      console.log('getUniqueTechnicians: No technicians found in work orders');
      return [];
    }

    // Get unique technician IDs
    const uniqueTechnicianIds = [...new Set(workOrdersData.map(wo => wo.technician_id).filter(Boolean))];
    
    console.log(`getUniqueTechnicians: Found ${uniqueTechnicianIds.length} unique technicians`);

    // Get technician details from profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', uniqueTechnicianIds);

    if (profilesError) {
      console.error('getUniqueTechnicians: Error fetching profiles:', profilesError);
      // Return basic data with IDs if profiles fetch fails
      return uniqueTechnicianIds.map(id => ({
        id: id as string,
        name: `Technician ${id?.slice(0, 8)}`
      }));
    }

    // Map profiles to technician format
    const technicians = (profilesData || []).map(profile => {
      const customer = Array.isArray(profile) && profile.length > 0 ? profile[0] : profile;
      return {
        id: customer?.id || '',
        name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email || 'Unknown' : 'Unknown'
      };
    });

    console.log(`getUniqueTechnicians: Successfully processed ${technicians.length} technicians`);
    return technicians;
  } catch (error) {
    console.error('getUniqueTechnicians: Unexpected error:', error);
    return [];
  }
};
