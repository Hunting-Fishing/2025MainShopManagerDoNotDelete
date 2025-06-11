
import { supabase } from '@/lib/supabase';
import { WorkOrder } from '@/types/workOrder';

export const getAllWorkOrders = async (): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching all work orders from database...');
    
    // Use the specific foreign key relationship to avoid ambiguity
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
          company
        ),
        vehicles!work_orders_vehicle_id_fkey (
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

    console.log(`Successfully fetched ${data?.length || 0} work orders`);
    
    // Normalize the data to match WorkOrder type expectations
    const normalizedData = data?.map((workOrder: any) => ({
      ...workOrder,
      customer_name: workOrder.customers 
        ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
        : undefined,
      customer_email: workOrder.customers?.email,
      customer_phone: workOrder.customers?.phone,
      company_name: workOrder.customers?.company,
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate,
        trim: workOrder.vehicles.trim
      } : undefined,
      vehicle_make: workOrder.vehicles?.make,
      vehicle_model: workOrder.vehicles?.model,
      vehicle_year: workOrder.vehicles?.year,
      vehicle_vin: workOrder.vehicles?.vin,
      vehicle_license_plate: workOrder.vehicles?.license_plate
    })) || [];

    return normalizedData as WorkOrder[];
  } catch (error) {
    console.error('Error in getAllWorkOrders:', error);
    throw error;
  }
};

export const getWorkOrderById = async (id: string): Promise<WorkOrder | null> => {
  try {
    console.log('Fetching work order with ID:', id);
    
    // Use the specific foreign key relationship to avoid ambiguity
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
          company,
          address,
          city,
          state,
          zip
        ),
        vehicles!work_orders_vehicle_id_fkey (
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
      .single();

    if (error) {
      console.error('Error fetching work order:', error);
      throw error;
    }

    if (!data) {
      console.log('No work order found with ID:', id);
      return null;
    }

    // Normalize the data to match WorkOrder type expectations
    const normalizedData = {
      ...data,
      customer_name: data.customers 
        ? `${data.customers.first_name || ''} ${data.customers.last_name || ''}`.trim()
        : undefined,
      customer_email: data.customers?.email,
      customer_phone: data.customers?.phone,
      customer_address: data.customers?.address,
      customer_city: data.customers?.city,
      customer_state: data.customers?.state,
      customer_zip: data.customers?.zip,
      company_name: data.customers?.company,
      vehicle: data.vehicles ? {
        id: data.vehicles.id,
        year: data.vehicles.year,
        make: data.vehicles.make,
        model: data.vehicles.model,
        vin: data.vehicles.vin,
        license_plate: data.vehicles.license_plate,
        trim: data.vehicles.trim
      } : undefined,
      vehicle_make: data.vehicles?.make,
      vehicle_model: data.vehicles?.model,
      vehicle_year: data.vehicles?.year,
      vehicle_vin: data.vehicles?.vin,
      vehicle_license_plate: data.vehicles?.license_plate
    };

    console.log('Work order fetched successfully:', normalizedData);
    return normalizedData as WorkOrder;
  } catch (error) {
    console.error('Error in getWorkOrderById:', error);
    throw error;
  }
};

export const getWorkOrdersByCustomerId = async (customerId: string): Promise<WorkOrder[]> => {
  try {
    console.log('Fetching work orders for customer:', customerId);
    
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
          company
        ),
        vehicles!work_orders_vehicle_id_fkey (
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
      console.error('Error fetching work orders by customer:', error);
      throw error;
    }

    // Normalize the data
    const normalizedData = data?.map((workOrder: any) => ({
      ...workOrder,
      customer_name: workOrder.customers 
        ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
        : undefined,
      customer_email: workOrder.customers?.email,
      customer_phone: workOrder.customers?.phone,
      company_name: workOrder.customers?.company,
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate,
        trim: workOrder.vehicles.trim
      } : undefined,
      vehicle_make: workOrder.vehicles?.make,
      vehicle_model: workOrder.vehicles?.model,
      vehicle_year: workOrder.vehicles?.year,
      vehicle_vin: workOrder.vehicles?.vin,
      vehicle_license_plate: workOrder.vehicles?.license_plate
    })) || [];

    return normalizedData as WorkOrder[];
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
        customers!work_orders_customer_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone,
          company
        ),
        vehicles!work_orders_vehicle_id_fkey (
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

    // Normalize the data
    const normalizedData = data?.map((workOrder: any) => ({
      ...workOrder,
      customer_name: workOrder.customers 
        ? `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim()
        : undefined,
      customer_email: workOrder.customers?.email,
      customer_phone: workOrder.customers?.phone,
      company_name: workOrder.customers?.company,
      vehicle: workOrder.vehicles ? {
        id: workOrder.vehicles.id,
        year: workOrder.vehicles.year,
        make: workOrder.vehicles.make,
        model: workOrder.vehicles.model,
        vin: workOrder.vehicles.vin,
        license_plate: workOrder.vehicles.license_plate,
        trim: workOrder.vehicles.trim
      } : undefined,
      vehicle_make: workOrder.vehicles?.make,
      vehicle_model: workOrder.vehicles?.model,
      vehicle_year: workOrder.vehicles?.year,
      vehicle_vin: workOrder.vehicles?.vin,
      vehicle_license_plate: workOrder.vehicles?.license_plate
    })) || [];

    return normalizedData as WorkOrder[];
  } catch (error) {
    console.error('Error in getWorkOrdersByStatus:', error);
    throw error;
  }
};

export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('technician_id')
      .not('technician_id', 'is', null);

    if (error) {
      console.error('Error fetching technicians:', error);
      throw error;
    }

    // Extract unique technician IDs
    const uniqueTechnicians = [...new Set(data?.map(item => item.technician_id).filter(Boolean))] || [];
    return uniqueTechnicians;
  } catch (error) {
    console.error('Error in getUniqueTechnicians:', error);
    throw error;
  }
};
