import { supabase } from '@/integrations/supabase/client';
import { WorkOrder, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { TimeEntry } from '@/types/workOrder';

// Helper functions (removed for brevity)

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('workOrderQueryService: Fetching all work orders with relations...');
    
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
      console.error('workOrderQueryService: Supabase error:', error);
      throw error;
    }

    if (!workOrders) {
      console.log('workOrderQueryService: No work orders found');
      return [];
    }

    console.log('workOrderQueryService: Raw work orders from DB:', workOrders.length);

    // Fetch related data for each work order
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (wo) => {
        try {
          // Fetch job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', wo.id);

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(jl => ({
            id: jl.id,
            workOrderId: jl.work_order_id, // Use camelCase property name
            name: jl.name || '',
            category: jl.category,
            subcategory: jl.subcategory,
            description: jl.description,
            estimatedHours: jl.estimated_hours,
            laborRate: jl.labor_rate,
            totalAmount: jl.total_amount,
            status: jl.status || 'pending',
            notes: jl.notes,
            createdAt: jl.created_at,
            updatedAt: jl.updated_at
          }));

          // Fetch inventory items
          const { data: inventoryData } = await supabase
            .from('work_order_inventory_items')
            .select('*')
            .eq('work_order_id', wo.id);

          const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
            id: item.id,
            workOrderId: item.work_order_id,
            name: item.name || '',
            sku: item.sku || '',
            category: item.category || '',
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            total: (item.quantity || 0) * (item.unit_price || 0),
            notes: item.notes
          }));

          // Fetch time entries
          const { data: timeData } = await supabase
            .from('work_order_time_entries')
            .select('*')
            .eq('work_order_id', wo.id);

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

          // Get customer info
          const customer = wo.customers;
          const vehicle = wo.vehicles;
          const technician = wo.profiles;

          return {
            ...wo,
            // Customer fields as strings for backward compatibility
            customer: customer ? `${customer.first_name} ${customer.last_name}` : '',
            customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
            customer_email: customer?.email || '',
            customer_phone: customer?.phone || '',
            customer_address: customer?.address || '',
            customer_city: customer?.city || '',
            customer_state: customer?.state || '',
            
            // Vehicle fields
            vehicle_make: vehicle?.make || '',
            vehicle_model: vehicle?.model || '',
            vehicle_year: vehicle?.year?.toString() || '',
            vehicle_vin: vehicle?.vin || '',
            vehicle_license_plate: vehicle?.license_plate || '',
            
            // Technician field as string for backward compatibility
            technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
            
            // Vehicle object for new components
            vehicle: vehicle ? {
              id: vehicle.id,
              year: vehicle.year?.toString() || '',
              make: vehicle.make || '',
              model: vehicle.model || '',
              vin: vehicle.vin || '',
              license_plate: vehicle.license_plate || ''
            } : undefined,
            
            // Related data arrays
            jobLines,
            inventoryItems,
            inventory_items: inventoryItems,
            timeEntries,
            
            // Backward compatibility fields
            date: wo.created_at,
            dueDate: wo.end_time,
            due_date: wo.end_time,
            priority: 'medium',
            location: '',
            notes: wo.description || ''
          } as WorkOrder;
        } catch (error) {
          console.error(`Error enriching work order ${wo.id}:`, error);
          return {
            ...wo,
            customer: '',
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            customer_address: '',
            customer_city: '',
            customer_state: '',
            vehicle_make: '',
            vehicle_model: '',
            vehicle_year: '',
            vehicle_vin: '',
            vehicle_license_plate: '',
            technician: '',
            jobLines: [],
            inventoryItems: [],
            inventory_items: [],
            timeEntries: [],
            date: wo.created_at,
            dueDate: wo.end_time,
            due_date: wo.end_time,
            priority: 'medium',
            location: '',
            notes: wo.description || ''
          } as WorkOrder;
        }
      })
    );

    console.log('workOrderQueryService: Successfully enriched', enrichedWorkOrders.length, 'work orders');
    return enrichedWorkOrders;

  } catch (error) {
    console.error('workOrderQueryService: Error in getAllWorkOrders:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('workOrderQueryService: Fetching work order by ID:', id);
    
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
          license_plate
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
      console.error('workOrderQueryService: Supabase error:', error);
      throw error;
    }

    if (!workOrder) {
      console.log('workOrderQueryService: Work order not found');
      return null;
    }

    // Fetch job lines
    const { data: jobLinesData } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrder.id);

    const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(jl => ({
      id: jl.id,
      workOrderId: jl.work_order_id, // Use camelCase property name
      name: jl.name || '',
      category: jl.category,
      subcategory: jl.subcategory,
      description: jl.description,
      estimatedHours: jl.estimated_hours,
      laborRate: jl.labor_rate,
      totalAmount: jl.total_amount,
      status: jl.status || 'pending',
      notes: jl.notes,
      createdAt: jl.created_at,
      updatedAt: jl.updated_at
    }));

    // Fetch inventory items
    const { data: inventoryData } = await supabase
      .from('work_order_inventory_items')
      .select('*')
      .eq('work_order_id', workOrder.id);

    const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      quantity: item.quantity || 0,
      unit_price: item.unit_price || 0,
      total: (item.quantity || 0) * (item.unit_price || 0),
      notes: item.notes
    }));

    // Fetch time entries
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

    // Get customer info
    const customer = workOrder.customers;
    const vehicle = workOrder.vehicles;
    const technician = workOrder.profiles;

    const enrichedWorkOrder: WorkOrder = {
      ...workOrder,
      // Customer fields as strings for backward compatibility
      customer: customer ? `${customer.first_name} ${customer.last_name}` : '',
      customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
      customer_email: customer?.email || '',
      customer_phone: customer?.phone || '',
      customer_address: customer?.address || '',
      customer_city: customer?.city || '',
      customer_state: customer?.state || '',
      
      // Vehicle fields
      vehicle_make: vehicle?.make || '',
      vehicle_model: vehicle?.model || '',
      vehicle_year: vehicle?.year?.toString() || '',
      vehicle_vin: vehicle?.vin || '',
      vehicle_license_plate: vehicle?.license_plate || '',
      
      // Technician field as string for backward compatibility
      technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
      
      // Vehicle object for new components
      vehicle: vehicle ? {
        id: vehicle.id,
        year: vehicle.year?.toString() || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        vin: vehicle.vin || '',
        license_plate: vehicle.license_plate || ''
      } : undefined,
      
      // Related data arrays
      jobLines,
      inventoryItems,
      inventory_items: inventoryItems,
      timeEntries,
      
      // Backward compatibility fields
      date: workOrder.created_at,
      dueDate: workOrder.end_time,
      due_date: workOrder.end_time,
      priority: 'medium',
      location: '',
      notes: workOrder.description || ''
    };

    console.log('workOrderQueryService: Successfully fetched work order:', enrichedWorkOrder.id);
    return enrichedWorkOrder;

  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrderById:', error);
    throw error;
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('workOrderQueryService: Fetching work orders for customer:', customerId);
    
    const { data: workOrders, error } = await supabase
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
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('workOrderQueryService: Supabase error:', error);
      throw error;
    }

    if (!workOrders) {
      console.log('workOrderQueryService: No work orders found for customer');
      return [];
    }

    // Enrich each work order with related data
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (wo) => {
        try {
          // Fetch job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', wo.id);

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(jl => ({
            id: jl.id,
            workOrderId: jl.work_order_id, // Use camelCase property name
            name: jl.name || '',
            category: jl.category,
            subcategory: jl.subcategory,
            description: jl.description,
            estimatedHours: jl.estimated_hours,
            laborRate: jl.labor_rate,
            totalAmount: jl.total_amount,
            status: jl.status || 'pending',
            notes: jl.notes,
            createdAt: jl.created_at,
            updatedAt: jl.updated_at
          }));

          // Fetch inventory items
          const { data: inventoryData } = await supabase
            .from('work_order_inventory_items')
            .select('*')
            .eq('work_order_id', wo.id);

          const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
            id: item.id,
            workOrderId: item.work_order_id,
            name: item.name || '',
            sku: item.sku || '',
            category: item.category || '',
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            total: (item.quantity || 0) * (item.unit_price || 0),
            notes: item.notes
          }));

          // Fetch time entries
          const { data: timeData } = await supabase
            .from('work_order_time_entries')
            .select('*')
            .eq('work_order_id', wo.id);

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

          // Get customer info
          const customer = wo.customers;
          const vehicle = wo.vehicles;
          const technician = wo.profiles;

          return {
            ...wo,
            // Customer fields as strings for backward compatibility
            customer: customer ? `${customer.first_name} ${customer.last_name}` : '',
            customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
            customer_email: customer?.email || '',
            customer_phone: customer?.phone || '',
            
            // Vehicle fields
            vehicle_make: vehicle?.make || '',
            vehicle_model: vehicle?.model || '',
            vehicle_year: vehicle?.year?.toString() || '',
            vehicle_vin: vehicle?.vin || '',
            vehicle_license_plate: vehicle?.license_plate || '',
            
            // Technician field as string for backward compatibility
            technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
            
            // Vehicle object for new components
            vehicle: vehicle ? {
              id: vehicle.id,
              year: vehicle.year?.toString() || '',
              make: vehicle.make || '',
              model: vehicle.model || '',
              vin: vehicle.vin || '',
              license_plate: vehicle.license_plate || ''
            } : undefined,
            
            // Related data arrays
            jobLines,
            inventoryItems,
            inventory_items: inventoryItems,
            timeEntries,
            
            // Backward compatibility fields
            date: wo.created_at,
            dueDate: wo.end_time,
            due_date: wo.end_time,
            priority: 'medium',
            location: '',
            notes: wo.description || ''
          } as WorkOrder;
        } catch (error) {
          console.error(`Error enriching work order ${wo.id}:`, error);
          return {
            ...wo,
            customer: '',
            customer_name: '',
            customer_email: '',
            customer_phone: '',
            vehicle_make: '',
            vehicle_model: '',
            vehicle_year: '',
            vehicle_vin: '',
            vehicle_license_plate: '',
            technician: '',
            jobLines: [],
            inventoryItems: [],
            inventory_items: [],
            timeEntries: [],
            date: wo.created_at,
            dueDate: wo.end_time,
            due_date: wo.end_time,
            priority: 'medium',
            location: '',
            notes: wo.description || ''
          } as WorkOrder;
        }
      })
    );

    console.log('workOrderQueryService: Successfully fetched', enrichedWorkOrders.length, 'work orders for customer');
    return enrichedWorkOrders;

  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrdersByCustomerId:', error);
    throw error;
  }
};

export const getWorkOrdersByStatus = async (status: string): Promise<WorkOrder[]> => {
  try {
    console.log('workOrderQueryService: Fetching work orders by status:', status);
    
    const { data: workOrders, error } = await supabase
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
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('workOrderQueryService: Supabase error:', error);
      throw error;
    }

    if (!workOrders) {
      console.log('workOrderQueryService: No work orders found for status');
      return [];
    }

    // Enrich each work order with related data
    const enrichedWorkOrders = await Promise.all(
      workOrders.map(async (wo) => {
        try {
          // Fetch job lines
          const { data: jobLinesData } = await supabase
            .from('work_order_job_lines')
            .select('*')
            .eq('work_order_id', wo.id);

          const jobLines: WorkOrderJobLine[] = (jobLinesData || []).map(jl => ({
            id: jl.id,
            workOrderId: jl.work_order_id, // Use camelCase property name
            name: jl.name || '',
            category: jl.category,
            subcategory: jl.subcategory,
            description: jl.description,
            estimatedHours: jl.estimated_hours,
            laborRate: jl.labor_rate,
            totalAmount: jl.total_amount,
            status: jl.status || 'pending',
            notes: jl.notes,
            createdAt: jl.created_at,
            updatedAt: jl.updated_at
          }));

          // Fetch inventory items
          const { data: inventoryData } = await supabase
            .from('work_order_inventory_items')
            .select('*')
            .eq('work_order_id', wo.id);

          const inventoryItems: WorkOrderInventoryItem[] = (inventoryData || []).map(item => ({
            id: item.id,
            workOrderId: item.work_order_id,
            name: item.name || '',
            sku: item.sku || '',
            category: item.category || '',
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            total: (item.quantity || 0) * (item.unit_price || 0),
            notes: item.notes
          }));

          // Fetch time entries
          const { data: timeData } = await supabase
            .from('work_order_time_entries')
            .select('*')
            .eq('work_order_id', wo.id);

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

          const customer = wo.customers;
          const vehicle = wo.vehicles;
          const technician = wo.profiles;

          return {
            ...wo,
            customer: customer ? `${customer.first_name} ${customer.last_name}` : '',
            customer_name: customer ? `${customer.first_name} ${customer.last_name}` : '',
            customer_email: customer?.email || '',
            customer_phone: customer?.phone || '',
            vehicle_make: vehicle?.make || '',
            vehicle_model: vehicle?.model || '',
            vehicle_year: vehicle?.year?.toString() || '',
            vehicle_vin: vehicle?.vin || '',
            vehicle_license_plate: vehicle?.license_plate || '',
            technician: technician ? `${technician.first_name} ${technician.last_name}` : '',
            vehicle: vehicle ? {
              id: vehicle.id,
              year: vehicle.year?.toString() || '',
              make: vehicle.make || '',
              model: vehicle.model || '',
              vin: vehicle.vin || '',
              license_plate: vehicle.license_plate || ''
            } : undefined,
            jobLines,
            inventoryItems: [],
            inventory_items: [],
            timeEntries: [],
            date: wo.created_at,
            dueDate: wo.end_time,
            due_date: wo.end_time,
            priority: 'medium',
            location: '',
            notes: wo.description || ''
          } as WorkOrder;
        } catch (error) {
          console.error(`Error enriching work order ${wo.id}:`, error);
          return {
            ...wo,
            customer: '',
            technician: '',
            jobLines: [],
            inventoryItems: [],
            inventory_items: [],
            timeEntries: [],
            date: wo.created_at,
            priority: 'medium',
            location: '',
            notes: wo.description || ''
          } as WorkOrder;
        }
      })
    );

    console.log('workOrderQueryService: Successfully fetched', enrichedWorkOrders.length, 'work orders by status');
    return enrichedWorkOrders;

  } catch (error) {
    console.error('workOrderQueryService: Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

export const getUniqueTechnicians = async () => {
  try {
    console.log('workOrderQueryService: Fetching unique technicians...');
    
    const { data: technicians, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .not('first_name', 'is', null)
      .not('last_name', 'is', null);

    if (error) {
      console.error('workOrderQueryService: Error fetching technicians:', error);
      throw error;
    }

    if (!technicians) {
      return [];
    }

    // Map to expected format with full name
    const formattedTechnicians = technicians.map(tech => ({
      id: tech.id,
      name: `${tech.first_name} ${tech.last_name}`,
      email: tech.email
    }));

    console.log('workOrderQueryService: Found', formattedTechnicians.length, 'technicians');
    return formattedTechnicians;

  } catch (error) {
    console.error('workOrderQueryService: Error in getUniqueTechnicians:', error);
    throw error;
  }
};
