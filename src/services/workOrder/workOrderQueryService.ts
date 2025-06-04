
import { supabase } from "@/lib/supabase";
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from "@/types/workOrder";
import { WorkOrderJobLine } from "@/types/jobLine";

// Helper function to safely cast status
const castJobLineStatus = (status: string): "pending" | "in-progress" | "completed" | "on-hold" => {
  const validStatuses = ["pending", "in-progress", "completed", "on-hold"];
  return validStatuses.includes(status) ? status as "pending" | "in-progress" | "completed" | "on-hold" : "pending";
};

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getAllWorkOrders: Starting query...');
    
    // First get work orders with basic customer and vehicle data
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getAllWorkOrders: Supabase error:', error);
      throw new Error(`Failed to fetch work orders: ${error.message}`);
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('getAllWorkOrders: No work orders found');
      return [];
    }

    console.log('getAllWorkOrders: Found work orders:', workOrders.length);

    // Get additional data for each work order
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        try {
          // Get job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', workOrder.id)
            .order('display_order');

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(line => ({
            id: line.id,
            workOrderId: line.work_order_id,
            name: line.name,
            category: line.category || '',
            subcategory: line.subcategory || '',
            description: line.description || '',
            estimatedHours: Number(line.estimated_hours || 0),
            laborRate: Number(line.labor_rate || 0),
            totalAmount: Number(line.total_amount || 0),
            status: castJobLineStatus(line.status || 'pending'),
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
            unit_price: item.unit_price,
            total: item.quantity * item.unit_price,
            notes: '' // notes field doesn't exist in the database table
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

          // Build customer name
          const customerName = workOrder.customers 
            ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
            : '';

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
            status: workOrder.status,
            description: workOrder.description,
            service_type: workOrder.service_type,
            invoice_id: workOrder.invoice_id,
            work_order_number: workOrder.work_order_number,
            
            // UI-friendly fields
            customer: customerName,
            customer_name: customerName,
            technician: '', // We'll need to get this separately if needed
            date: workOrder.created_at,
            dueDate: workOrder.end_time,
            due_date: workOrder.end_time,
            priority: 'medium', // Default priority
            location: '',
            notes: workOrder.description || '',
            
            // Vehicle info
            vehicle_year: workOrder.vehicles?.year?.toString() || '',
            vehicle_make: workOrder.vehicles?.make || '',
            vehicle_model: workOrder.vehicles?.model || '',
            vehicle_vin: workOrder.vehicles?.vin || '',
            vehicle_license_plate: workOrder.vehicles?.license_plate || '',
            vehicle: workOrder.vehicles,
            
            // Related data
            jobLines,
            timeEntries,
            inventoryItems,
            inventory_items: inventoryItems
          } as WorkOrder;
        } catch (error) {
          console.error('Error enriching work order:', workOrder.id, error);
          // Return basic work order if enrichment fails
          return {
            ...workOrder,
            customer: '',
            customer_name: '',
            technician: '',
            date: workOrder.created_at,
            dueDate: workOrder.end_time,
            due_date: workOrder.end_time,
            priority: 'medium',
            location: '',
            notes: workOrder.description || '',
            vehicle_year: '',
            vehicle_make: '',
            vehicle_model: '',
            vehicle_vin: '',
            vehicle_license_plate: '',
            jobLines: [],
            timeEntries: [],
            inventoryItems: [],
            inventory_items: []
          } as WorkOrder;
        }
      })
    );

    console.log('getAllWorkOrders: Successfully enriched work orders');
    return enrichedWorkOrders;
  } catch (error) {
    console.error('getAllWorkOrders: Error:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('getWorkOrderById: Fetching work order:', id);
    
    // Get work order with related data
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('getWorkOrderById: Supabase error:', error);
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch work order: ${error.message}`);
    }

    if (!workOrder) {
      console.log('getWorkOrderById: Work order not found');
      return null;
    }

    // Get job lines
    const { data: jobLinesData } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrder.id)
      .order('display_order');

    const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(line => ({
      id: line.id,
      workOrderId: line.work_order_id,
      name: line.name,
      category: line.category || '',
      subcategory: line.subcategory || '',
      description: line.description || '',
      estimatedHours: Number(line.estimated_hours || 0),
      laborRate: Number(line.labor_rate || 0),
      totalAmount: Number(line.total_amount || 0),
      status: castJobLineStatus(line.status || 'pending'),
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
      unit_price: item.unit_price,
      total: item.quantity * item.unit_price,
      notes: '' // notes field doesn't exist in the database table
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

    // Build customer name
    const customerName = workOrder.customers 
      ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
      : '';

    const result: WorkOrder = {
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
      status: workOrder.status,
      description: workOrder.description,
      service_type: workOrder.service_type,
      invoice_id: workOrder.invoice_id,
      work_order_number: workOrder.work_order_number,
      
      // UI-friendly fields
      customer: customerName,
      customer_name: customerName,
      technician: '', // We'll need to get this separately if needed
      date: workOrder.created_at,
      dueDate: workOrder.end_time,
      due_date: workOrder.end_time,
      priority: 'medium', // Default priority
      location: '',
      notes: workOrder.description || '',
      
      // Vehicle info
      vehicle_year: workOrder.vehicles?.year?.toString() || '',
      vehicle_make: workOrder.vehicles?.make || '',
      vehicle_model: workOrder.vehicles?.model || '',
      vehicle_vin: workOrder.vehicles?.vin || '',
      vehicle_license_plate: workOrder.vehicles?.license_plate || '',
      vehicle: workOrder.vehicles,
      
      // Related data
      jobLines,
      timeEntries,
      inventoryItems,
      inventory_items: inventoryItems
    };

    console.log('getWorkOrderById: Successfully fetched work order');
    return result;
  } catch (error) {
    console.error('getWorkOrderById: Error:', error);
    throw error;
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersByCustomerId: Fetching for customer:', customerId);
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getWorkOrdersByCustomerId: Supabase error:', error);
      throw new Error(`Failed to fetch work orders for customer: ${error.message}`);
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('getWorkOrdersByCustomerId: No work orders found for customer');
      return [];
    }

    // Enrich with additional data
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (workOrder) => {
        try {
          // Get job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', workOrder.id)
            .order('display_order');

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(line => ({
            id: line.id,
            workOrderId: line.work_order_id,
            name: line.name,
            category: line.category || '',
            subcategory: line.subcategory || '',
            description: line.description || '',
            estimatedHours: Number(line.estimated_hours || 0),
            laborRate: Number(line.labor_rate || 0),
            totalAmount: Number(line.total_amount || 0),
            status: castJobLineStatus(line.status || 'pending'),
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
            unit_price: item.unit_price,
            total: item.quantity * item.unit_price,
            notes: '' // notes field doesn't exist in the database table
          }));

          // Build customer name
          const customerName = workOrder.customers 
            ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
            : '';

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
            status: workOrder.status,
            description: workOrder.description,
            service_type: workOrder.service_type,
            invoice_id: workOrder.invoice_id,
            work_order_number: workOrder.work_order_number,
            
            // UI-friendly fields
            customer: customerName,
            customer_name: customerName,
            technician: '',
            date: workOrder.created_at,
            dueDate: workOrder.end_time,
            due_date: workOrder.end_time,
            priority: 'medium',
            location: '',
            notes: workOrder.description || '',
            
            // Vehicle info
            vehicle_year: workOrder.vehicles?.year?.toString() || '',
            vehicle_make: workOrder.vehicles?.make || '',
            vehicle_model: workOrder.vehicles?.model || '',
            vehicle_vin: workOrder.vehicles?.vin || '',
            vehicle_license_plate: workOrder.vehicles?.license_plate || '',
            vehicle: workOrder.vehicles,
            
            // Related data
            jobLines,
            timeEntries: [],
            inventoryItems,
            inventory_items: inventoryItems
          } as WorkOrder;
        } catch (error) {
          console.error('Error enriching work order for customer:', workOrder.id, error);
          return {
            ...workOrder,
            customer: '',
            customer_name: '',
            technician: '',
            date: workOrder.created_at,
            dueDate: workOrder.end_time,
            due_date: workOrder.end_time,
            priority: 'medium',
            location: '',
            notes: workOrder.description || '',
            vehicle_year: '',
            vehicle_make: '',
            vehicle_model: '',
            vehicle_vin: '',
            vehicle_license_plate: '',
            jobLines: [],
            timeEntries: [],
            inventoryItems: [],
            inventory_items: []
          } as WorkOrder;
        }
      })
    );

    console.log('getWorkOrdersByCustomerId: Successfully fetched work orders for customer');
    return enrichedWorkOrders;
  } catch (error) {
    console.error('getWorkOrdersByCustomerId: Error:', error);
    throw error;
  }
};

export const getWorkOrdersForCalendar = async (): Promise<WorkOrder[]> => {
  try {
    console.log('getWorkOrdersForCalendar: Fetching calendar work orders...');
    
    const { data: workOrders, error } = await supabase
      .from('work_orders')
      .select(`
        *,
        customers (
          id,
          first_name,
          last_name,
          email
        ),
        vehicles (
          id,
          year,
          make,
          model,
          vin,
          license_plate
        )
      `)
      .not('start_time', 'is', null)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('getWorkOrdersForCalendar: Supabase error:', error);
      throw new Error(`Failed to fetch calendar work orders: ${error.message}`);
    }

    if (!workOrders || workOrders.length === 0) {
      console.log('getWorkOrdersForCalendar: No scheduled work orders found');
      return [];
    }

    // Map to simplified format for calendar
    const calendarWorkOrders = workOrders.map(workOrder => {
      const customerName = workOrder.customers 
        ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
        : '';

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
        status: workOrder.status,
        description: workOrder.description,
        service_type: workOrder.service_type,
        invoice_id: workOrder.invoice_id,
        work_order_number: workOrder.work_order_number,
        
        // UI-friendly fields
        customer: customerName,
        customer_name: customerName,
        technician: '',
        date: workOrder.created_at,
        dueDate: workOrder.end_time,
        due_date: workOrder.end_time,
        priority: 'medium',
        location: '',
        notes: workOrder.description || '',
        
        // Vehicle info
        vehicle_year: workOrder.vehicles?.year?.toString() || '',
        vehicle_make: workOrder.vehicles?.make || '',
        vehicle_model: workOrder.vehicles?.model || '',
        vehicle_vin: workOrder.vehicles?.vin || '',
        vehicle_license_plate: workOrder.vehicles?.license_plate || '',
        vehicle: workOrder.vehicles,
        
        // Related data (empty for calendar view)
        jobLines: [],
        timeEntries: [],
        inventoryItems: [],
        inventory_items: []
      } as WorkOrder;
    });

    console.log('getWorkOrdersForCalendar: Successfully fetched calendar work orders');
    return calendarWorkOrders;
  } catch (error) {
    console.error('getWorkOrdersForCalendar: Error:', error);
    throw error;
  }
};

export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    console.log('getUniqueTechnicians: Fetching unique technicians...');
    
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('getUniqueTechnicians: Supabase error:', error);
      throw new Error(`Failed to fetch technicians: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('getUniqueTechnicians: No technicians found');
      return [];
    }

    // Get unique technician IDs and try to get their names from profiles
    const uniqueTechnicianIds = [...new Set(data.map(item => item.technician_id).filter(Boolean))];
    
    // For now, just return the IDs since we don't have a direct relationship
    // In the future, we might want to fetch actual names from profiles
    console.log('getUniqueTechnicians: Found unique technicians:', uniqueTechnicianIds.length);
    return uniqueTechnicianIds;
  } catch (error) {
    console.error('getUniqueTechnicians: Error:', error);
    throw error;
  }
};
